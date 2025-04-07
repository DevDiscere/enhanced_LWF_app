from flask import Flask, request, jsonify, send_file
from PIL import Image
import io

app = Flask(__name__)

@app.route("/")
def index():
    return send_file("templates/index.html")

@app.route("/process", methods=["POST"])
def process_image():
    image_file = request.files.get("image")
    if not image_file:
        return {"error": "No image provided"}, 400

    # Load the image into memory
    image = Image.open(image_file.stream)

    # Grab the form values
    try:
        show_visualizations = request.form.get("show_visualizations") == "true"
        max_iterations = int(request.form.get("max_iterations", 3))
        penumbra_size = int(request.form.get("penumbra_size", 2))
        upper_bounds = int(request.form.get("upper_bounds", 16))
    except Exception as e:
        return {"error": f"Invalid form data: {str(e)}"}, 400


    # ✅ Debug print to confirm backend received them
    print("🔧 Form values received:")
    print("Image file", image_file.filename)
    print("Show Visualizations:", show_visualizations)
    print("Max Iterations:", max_iterations)
    print("Penumbra Size:", penumbra_size)
    print("Upper Bounds:", upper_bounds)

    # For now, return a simple confirmation
    return jsonify({
        "message": "Form values received",
        "image_file": image_file.filename,
        "show_visualizations": show_visualizations,
        "max_iterations": max_iterations,
        "penumbra_size": penumbra_size,
        "upper_bounds": upper_bounds
    })

    # # 🧪 Your shadow detection/removal function here
    # # Let's say it returns a PIL Image
    # processed_image = shadow_removal(
    #     image,
    #     show_visualizations=show_visualizations,
    #     max_iterations=max_iterations,
    #     penumbra_size=penumbra_size,
    #     upper_bounds=upper_bounds
    # )

    # # Save to memory
    # img_io = io.BytesIO()
    # processed_image.save(img_io, format="PNG")
    # img_io.seek(0)

    # return send_file(img_io, mimetype="image/png")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

