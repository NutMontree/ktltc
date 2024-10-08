import rembg
import numpy as np
from PIL import Image

# โหลดภาพอินพุต
input_image = Image.open('D:/ktltc/public/images/ผู้บริหาร/ad1.webp')

# แปลงภาพอินพุตเป็นอาร์เรย์ numpy
input_array = np.array(input_image)

# ใช้การลบพื้นหลังโดยใช้ rembg
output_array = rembg.remove(input_array)

# สร้างภาพ PIL จากอาร์เรย์เอาท์พุต
output_image = Image.fromarray(output_array)

# บันทึกภาพเอาท์พุต
output_image.save('D:/ktltc/public/images/ผู้บริหาร/ad1.webp')