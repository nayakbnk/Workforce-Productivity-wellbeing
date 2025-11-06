# utils.py
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import requests

def read_image_from_file_storage(file_storage):
    """Reads a Flask FileStorage object into an OpenCV BGR image."""
    file_bytes = file_storage.read()
    np_arr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img

def read_image_from_base64(b64_string):
    """Read base64 (data URI or plain base64) to OpenCV BGR image."""
    if b64_string.startswith('data:'):
        b64_string = b64_string.split(',', 1)[1]
    img_data = base64.b64decode(b64_string)
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img

def read_image_from_url(url, timeout=8):
    """Fetch image from URL and return OpenCV BGR image."""
    r = requests.get(url, stream=True, timeout=timeout)
    r.raise_for_status()
    img_pil = Image.open(r.raw).convert('RGB')
    img = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
    return img

def bgr_to_jpeg_bytes(img_bgr):
    """Encode BGR image to JPEG bytes."""
    ret, buf = cv2.imencode('.jpg', img_bgr)
    if not ret:
        raise ValueError("Failed to encode image")
    return buf.tobytes()

def extract_bounding_boxes_opencv(img_bgr, scaleFactor=1.1, minNeighbors=5):
    """Quick face detection using OpenCV's Haarcascade (fast) -> returns boxes in x,y,w,h."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    # Use the included Haar cascades (this file is included with OpenCV)
    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    face_cascade = cv2.CascadeClassifier(cascade_path)
    boxes = face_cascade.detectMultiScale(gray, scaleFactor=scaleFactor, minNeighbors=minNeighbors)
    result = []
    for (x, y, w, h) in boxes:
        result.append({'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h)})
    return result
