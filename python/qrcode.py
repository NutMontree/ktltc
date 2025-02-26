# import pyqrcode 

# link = input ("กรอกข้อมูล QR-Code : ")
# qr_code = pyqrcode.create(link)
# qr_code.png("QRCode.png", scale=5)
# qr_code.show()



# import pyqrcode 
 
# url = pyqrcode.create('https://docs.google.com/forms/d/e/1FAIpQLSdEf2XmgVMrNhz7Fl6O_8e_4yp5SjWyGxhC-pM64vIMPfBw3w/viewform')
# url.svg('QRCode.svg', scale=8)
# print(url.terminal(quiet_zone=1))

import pyqrcode

# Create QR code from URL
url = input("Enter URL: ")
qr = pyqrcode.create(url)

# Save QR code as PNG file
qr.svg("qrcode.png", scale=4)

# Print QR code to terminal
print(qr.terminal(quiet_zone=1))

# https://docs.google.com/forms/d/e/1FAIpQLSdEf2XmgVMrNhz7Fl6O_8e_4yp5SjWyGxhC-pM64vIMPfBw3w/viewform