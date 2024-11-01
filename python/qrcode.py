# import pyqrcode 

# link = input ("กรอกข้อมูล QR-Code : ")
# qr_code = pyqrcode.create(link)
# qr_code.png("QRCode.png", scale=5)
# qr_code.show()
import pyqrcode
url = pyqrcode.create('https://forms.gle/Bw6VzUzYengkBPP76')
url.svg('QRCode.svg', scale=8)
print(url.terminal(quiet_zone=1))