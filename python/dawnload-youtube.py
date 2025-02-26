from pytube import YouTube

def Download(link):
    youtubeObject = YouTube(link)
    youtubeObject = youtubeObject.streams.get_highest_resolution()
    try:
        youtubeObject.download()
    except:
        print("เกิดข้อผิดพลาด")
    print("การดาวน์โหลดเสร็จสมบูรณ์แล้ว")


link = input("ป้อน URL วิดีโอ YouTube: ")
Download(link)