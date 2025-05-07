# https://voice.botnoi.ai/tts/api-developer
# Ai Bot Voice คงเหลือ 1991 พอยท์
# https://voice.botnoi.ai/marketplace/selectvoice รายชื่อเสียงคนพากย์

import requests
url = "https://api-voice.botnoi.ai/openapi/v1/generate_audio"
payload = {
    "text": "hello word",
    "speaker": "1",
    "volume": 1,
    "speed": 1,
    "type_media": "mp3",
    "save_file": "true",
    "language": "th",
}
headers = {
  'Botnoi-Token': 'cDI5WHdOMWVLQlc2T0RlaXdjZW1ocDZsZ2MyMzU2MTg5NA==',
  'Content-Type': 'application/json'
}
response = requests.request("POST", url, headers=headers, json=payload)
print(response.content)
        