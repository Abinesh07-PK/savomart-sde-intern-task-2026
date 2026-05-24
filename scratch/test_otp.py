import requests, json, sys
url = 'http://localhost:8000/api/auth/request-otp'
payload = {'mobile_number': '9999999999'}
resp = requests.post(url, json=payload)
print('Status:', resp.status_code)
print('Response:', resp.json())
