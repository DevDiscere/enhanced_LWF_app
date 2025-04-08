import cv2
import base64
import io
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas

def encode_image_to_base64(img):
    """Encodes a BGR or grayscale image to base64 PNG format."""
    success, buffer = cv2.imencode('.png', img)
    if not success:
        raise ValueError("Image encoding failed")
    return base64.b64encode(buffer).decode('utf-8')

def encode_figure_to_base64(fig):
    """Encodes a Matplotlib figure to base64 PNG format."""
    buf = io.BytesIO()
    canvas = FigureCanvas(fig)
    canvas.print_png(buf)
    buf.seek(0)
    img_bytes = buf.getvalue()
    return base64.b64encode(img_bytes).decode('utf-8')

def visualize_all_outputs(shading_map, colored_mask, enhanced_umbra, masks, channel_data):
    """
    Converts various shadow processing outputs into base64-encoded images for JSON serialization.
    Excludes the original image. Includes shading, masks, enhancements, and histograms.
    """

    # Generate histogram figure from channel data
    fig = plt.figure(figsize=(15, 8))
    axs = fig.subplots(3, 1)
    fig.suptitle("Channel Histograms (Blue, Green, Red)")

    for ax, data in zip(axs, channel_data):
        hist = cv2.calcHist([data["channel"]], [0], None, [256], [0, 256])
        ax.plot(hist, color=data["color"])
        ax.set_xlim(0, 256)
        ax.set_title(f"{data['name']} Channel Histogram")
        ax.set_xlabel("Bins")
        ax.set_ylabel("Pixel Count")
        ax.axvline(data["lower_bound"], color=data["color"], linestyle='--', label=f'Lower: {data["lower_bound"]}')
        ax.axvline(data["upper_bound"], color=data["color"], linestyle='-.', label=f'Upper: {data["upper_bound"]}')
        ax.legend()
    plt.tight_layout(rect=[0, 0, 1, 0.96])

    # Convert all visuals to base64 strings
    visuals = {
        "shading_map": encode_image_to_base64(shading_map),
        "colored_mask": encode_image_to_base64(colored_mask),
        "enhanced_umbra": encode_image_to_base64(enhanced_umbra),
        "histograms": encode_figure_to_base64(fig),
        "mask_blue": encode_image_to_base64(masks[0]),
        "mask_green": encode_image_to_base64(masks[1]),
        "mask_red": encode_image_to_base64(masks[2]),
    }

    return visuals
