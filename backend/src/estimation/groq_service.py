from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from groq import Groq
import json

# Load environment variables
load_dotenv()

# Check for GROQ API key
api_key = os.getenv('GROQ_API_KEY')
if not api_key:
    raise ValueError("GROQ_API_KEY environment variable is not set")

# Initialize Flask app
app = Flask(__name__)

# Initialize Groq client
client = Groq(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1"
)

@app.route('/estimate-build', methods=['POST'])
def estimate_build():
    try:
        data = request.json
        image_url = data.get('image_url')
        
        if not image_url:
            return jsonify({
                "success": False,
                "error": "No image URL provided"
            }), 400
        
        completion = client.chat.completions.create(
            model="llama-3.2-90b-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this furniture image and estimate the build cost"
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            }
                        }
                    ]
                }
            ],
            temperature=0.7,
            max_completion_tokens=1024,
            top_p=1,
            stream=False
        )
        
        return jsonify({
            "success": True,
            "estimation": completion.choices[0].message.content
        })
    except Exception as e:
        print(f"Error in estimate_build: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/estimate-repair', methods=['POST'])
def estimate_repair():
    try:
        data = request.json
        image_url = data.get('image_url')
        
        if not image_url:
            return jsonify({
                "success": False,
                "error": "No image URL provided"
            }), 400
        
        completion = client.chat.completions.create(
            model="llama-3.2-90b-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this furniture image and estimate the repair cost and required work"
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            }
                        }
                    ]
                }
            ],
            temperature=0.7,
            max_completion_tokens=1024,
            top_p=1,
            stream=False
        )
        
        return jsonify({
            "success": True,
            "estimation": completion.choices[0].message.content
        })
    except Exception as e:
        print(f"Error in estimate_repair: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001) 