'''
This is the enhanced implementation of Wang and Chen's Local Water-Filling Algorithm for Shadow Detection and Removal of Document Images
'''

from python_algo.liangyc_integral_thresholding import apply_adaptive_threshold
import cv2
import numpy as np

# Process 1
def local_water_filling(image, alpha=0.22, max_iterations=3, epsilon=1e-3):
    """
    Generates a shading map using a water-filling process.
    Optimized by using vectorized neighbor computations and cv2.dilate.
    """
    channels = cv2.split(image)
    shaded_channels = []
    kernel = np.array([[0, 1, 0],
                       [1, 0, 1],
                       [0, 1, 0]], dtype=np.uint8)

    for channel in channels:
        K = channel.astype(np.float32)
        for iteration in range(max_iterations):
            K_prev = K.copy()

            # Fast computation of neighbor maximum via dilation
            h_m = cv2.dilate(K, kernel, borderType=cv2.BORDER_CONSTANT, borderValue=0)

            # Vectorized shifts for effusion computation
            K_up    = np.empty_like(K); K_up[1:, :], K_up[0, :] = K[:-1, :], 0
            K_down  = np.empty_like(K); K_down[:-1, :], K_down[-1, :] = K[1:, :], 0
            K_left  = np.empty_like(K); K_left[:, 1:], K_left[:, 0] = K[:, :-1], 0
            K_right = np.empty_like(K); K_right[:, :-1], K_right[:, -1] = K[:, 1:], 0

            # Compute negative differences in one shot
            w_e = np.minimum(K_up - K, 0) + np.minimum(K_down - K, 0) + \
                  np.minimum(K_left - K, 0) + np.minimum(K_right - K, 0)

            # Flooding: difference between max neighbor and current value
            w_f = h_m - K

            # Update the shading map
            K += w_f + alpha * w_e

            if np.max(np.abs(K - K_prev)) < epsilon:
                break

        shaded_channels.append(K.astype(np.uint8))
    shading_map = cv2.merge(shaded_channels)
    return shading_map



# Process 2
def separate_umbra_and_penumbra(image, shading_map, upper_bound, penumbra_size=2):
    mean_shift_filtered = cv2.pyrMeanShiftFiltering(shading_map, 31, 25, maxLevel=1)
    median_blurred = cv2.medianBlur(mean_shift_filtered, 21)

    channels = cv2.split(median_blurred)
    masks = []
    channel_data = []

    colors = ['blue', 'green', 'red']
    channel_names = ['Blue', 'Green', 'Red']

    for i, channel in enumerate(channels):
        min_val = int(channel.min())
        upper_val = int(min_val + upper_bound)
        mask = cv2.inRange(channel, min_val, upper_val)

        masks.append(mask)
        channel_data.append({
            "channel": channel,
            "lower_bound": min_val,
            "upper_bound": upper_val,
            "color": colors[i],
            "name": channel_names[i]
        })

    umbra_mask = masks[0]
    for mask in masks[1:]:
        umbra_mask = cv2.bitwise_and(umbra_mask, mask)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    expanded_mask = cv2.dilate(umbra_mask, kernel, iterations=penumbra_size)
    penumbra_mask = cv2.subtract(expanded_mask, umbra_mask)

    # Create colored overlays for umbra and penumbra while preserving non-shadow regions
    umbra_colored = image.copy()
    penumbra_colored = image.copy()

    # Highlight umbra regions in blue (set Blue channel to 255)
    umbra_colored[:, :, 0] = np.where(umbra_mask > 0, 255, image[:, :, 0])

    # Highlight penumbra regions in red (set Red channel to 255)
    penumbra_colored[:, :, 2] = np.where(penumbra_mask > 0, 255, image[:, :, 2])

    # Combine both into a single visualization
    colored_mask = image.copy()
    colored_mask[umbra_mask > 0] = umbra_colored[umbra_mask > 0]
    colored_mask[penumbra_mask > 0] = penumbra_colored[penumbra_mask > 0]

    return median_blurred, umbra_mask, penumbra_mask, colored_mask, masks, channel_data



# Process 3
def umbra_enhancement(image, median_map, umbra_mask, min_scale=1.5, max_scale=2.5, epsilon=1e-5):
    """
    Enhances the umbra regions using vectorized scaling based on Retinex theory.
    Replaces per-channel loops with broadcasting for efficiency.
    """
    # Compute global intensity (G) from unshadowed areas and local intensity (L) from shadowed areas.
    unshadowed_pixels = median_map[umbra_mask == 0]
    if unshadowed_pixels.size == 0:
        raise ValueError("No unshadowed pixels found in the image.")
    G = np.mean(unshadowed_pixels, axis=0)

    shadowed_pixels = median_map[umbra_mask > 0]
    if shadowed_pixels.size == 0:
        raise ValueError("No shadowed pixels found in the image.")
    L = np.mean(shadowed_pixels, axis=0)

    # Calculate scale factors for each channel with broadcasting.
    scale_factors = np.clip(G / (L + epsilon), min_scale, max_scale)
    
    # Expand scale_factors and umbra_mask dimensions to perform vectorized multiplication.
    mask = (umbra_mask > 0)[..., None]  # shape: (H, W, 1)
    image_float = image.astype(np.float32)
    # Compute enhanced image: scale only the shadowed regions and clip at G.
    enhanced = np.where(mask, np.minimum(image_float * scale_factors, G), image_float)
    enhanced_umbra = np.clip(enhanced, 0, 255).astype(np.uint8)

    return enhanced_umbra, G, L



# Process 4
def penumbra_enhancement(enhanced_umbra, penumbra_mask, G, L, min_scale=1.5, max_scale=2.5, epsilon=1e-5):
    """
    Enhance the penumbra regions of an image by applying scale factors and adaptive thresholding.

    Parameters:
    enhanced_umbra (np.ndarray): The input image with enhanced umbra regions.
    penumbra_mask (np.ndarray): A binary mask indicating the penumbra regions.
    G (np.ndarray): The global color values for each channel.
    L (np.ndarray): The local color values for each channel.
    min_scale (float): The minimum scale factor to apply. Default is 1.5.
    max_scale (float): The maximum scale factor to apply. Default is 2.5.
    epsilon (float): A small value to avoid division by zero. Default is 1e-5.

    Returns:
    np.ndarray: The final enhanced image with penumbra regions processed.
    """

    # Convert to float for precision
    enhanced_penumbra = enhanced_umbra.astype(np.float32)

    # Compute scale factors for all channels at once
    scale_factors = np.clip(G / (L + epsilon), min_scale, max_scale).reshape(1, 1, 3)

    # Apply scale factor only where penumbra mask is present
    mask = penumbra_mask > 0
    enhanced_penumbra[mask] = np.minimum(enhanced_umbra[mask] * scale_factors, G)

    # Apply adaptive thresholding on the enhanced penumbra
    binary_image = apply_adaptive_threshold(enhanced_penumbra, threshold_param=0.15)

    # Create a mask for text areas using Canny edge detection
    edges = cv2.Canny(binary_image.astype(np.uint8), 100, 200)  # Canny edge detector
    text_mask = edges > 0  # Assuming that edges correspond to text regions

    # Replace detected penumbra shadow lines with G values (vectorized operation)
    enhanced_penumbra[(binary_image == 255) & (~text_mask)] = G

    enhanced_penumbra = np.clip(enhanced_penumbra, 0, 255).astype(np.uint8)

    # Return the final enhanced image
    return enhanced_penumbra
