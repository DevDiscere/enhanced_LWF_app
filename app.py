import numpy as np
import cv2
import traceback
from flask import Flask, request, jsonify, send_file
from python_algo.enhanced_LWF import (
    local_water_filling, 
    separate_umbra_and_penumbra, 
    umbra_enhancement, 
    penumbra_enhancement,
)
from python_algo.generate_visualizations import (
    encode_image_to_base64,
    visualize_all_outputs,
)

app = Flask(__name__)

@app.route("/")
def index():
    return send_file("templates/index.html")

@app.route('/process', methods=['POST'])
def process_image():
    image_file = request.files.get('image')
    if not image_file:
        return jsonify({'error': 'No image file provided'}), 400

    # Parse input parameters
    show_visualizations = request.form.get('show_visualizations', 'false').lower() == 'true'
    max_iterations = int(request.form.get('max_iterations', 3))
    penumbra_size = int(request.form.get('penumbra_size', 2))
    upper_bounds = int(request.form.get('upper_bounds', 16))

    try:
        # Decode image
        file_bytes = np.frombuffer(image_file.read(), np.uint8)
        image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        # Shadow removal pipeline
        shading_map = local_water_filling(image, max_iterations=max_iterations)
        median_map, umbra_mask, penumbra_mask, colored_mask, masks, channel_data = separate_umbra_and_penumbra(
            image, shading_map, upper_bounds, penumbra_size
        )
        enhanced_umbra, G, L = umbra_enhancement(image, median_map, umbra_mask)
        enhanced_penumbra = penumbra_enhancement(enhanced_umbra, penumbra_mask, G, L)

        # Base64-encoded result
        response_data = {
            "enhanced_penumbra": encode_image_to_base64(enhanced_penumbra)
        }

        # Include visualizations if requested
        if show_visualizations:
            visuals = visualize_all_outputs(
                shading_map, colored_mask, enhanced_umbra, masks, channel_data
            )
            visuals["enhanced_penumbra"] = response_data["enhanced_penumbra"]
            response_data = {
                "visualizations": visuals
            }

        return jsonify(response_data)

    # Inside your except block:
    except Exception as e:
        print("❌ Exception occurred during processing:")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

# @app.route("/process", methods=["POST"])
# def process_image():
#     image_file = request.files.get("image")
#     if not image_file:
#         return {"error": "No image provided"}, 400

#     # Load image
#     image = Image.open(image_file.stream).convert("RGB")
#     image_np = np.array(image)

#     # Grab the form values
#     try:
#         show_visualizations = request.form.get("show_visualizations") == "true"
#         max_iterations = int(request.form.get("max_iterations", 3))
#         penumbra_size = int(request.form.get("penumbra_size", 2))
#         upper_bounds = int(request.form.get("upper_bounds", 16))
#     except Exception as e:
#         return {"error": f"Invalid form data: {str(e)}"}, 400


#     # ✅ Debug print to confirm backend received them
#     print("🔧 Form values received:")
#     print("Image file", image_file.filename)
#     print("Show Visualizations:", show_visualizations)
#     print("Max Iterations:", max_iterations)
#     print("Penumbra Size:", penumbra_size)
#     print("Upper Bounds:", upper_bounds)

#     # Run the shadow removal pipeline
#     shading_map = local_water_filling(image_np, max_iterations=max_iterations)
#     median_map, umbra_mask, penumbra_mask, _, _, _ = separate_umbra_and_penumbra(
#         image_np,
#         shading_map,
#         upper_bounds=[upper_bounds] * 3,
#         penumbra_size=penumbra_size
#     )
#     enhanced_umbra, G, L = umbra_enhancement(image_np, median_map, umbra_mask)
#     enhanced_penumbra = penumbra_enhancement(enhanced_umbra, penumbra_mask, G, L)

#     # Convert final image to bytes
#     final_pil = Image.fromarray(enhanced_penumbra)
#     img_io = io.BytesIO()
#     final_pil.save(img_io, format="PNG")
#     img_io.seek(0)

#     # # For now, return a simple confirmation
#     # return jsonify({
#     #     "message": "Form values received",
#     #     "image_file": image_file.filename,
#     #     "show_visualizations": show_visualizations,
#     #     "max_iterations": max_iterations,
#     #     "penumbra_size": penumbra_size,
#     #     "upper_bounds": upper_bounds
#     # })

#     # return send_file(img_io, mimetype="image/png")
