# from pytube import YouTube

# def Download(link):
#     youtubeObject = YouTube(link)
#     youtubeObject = youtubeObject.streams.get_highest_resolution()
#     try:
#         youtubeObject.download()
#     except:
#         print("เกิดข้อผิดพลาด")
#     print("การดาวน์โหลดเสร็จสมบูรณ์แล้ว")


# link = input("ป้อน URL วิดีโอ YouTube: ")
# Download(link)

# //////////////////////////////////////////////////////////////////////////

# from pytube import YouTube

# def Download(link):
#     youtubeObject = YouTube(link)
#     youtubeObject = youtubeObject.streams.get_highest_resolution()
#     try:
#         youtubeObject.download()
#         print("การดาวน์โหลดเสร็จสมบูรณ์แล้ว")
#     except:
#         print("เกิดข้อผิดพลาด")

# if __name__ == "__main__":
#     link = input("ป้อน URL วิดีโอ YouTube: ")
#     Download(link)

# //////////////////////////////////////////////////////////////////////////
import requests # type: ignore
import re
import os

def download_facebook_video(url, save_path='downloads'):
    try:
        # Create downloads directory if it doesn't exist
        if not os.path.exists(save_path):
            os.makedirs(save_path)

        # Get the webpage content
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Try to find HD video URL
        video_url = None
        hd_pattern = r'hd_src:"(.+?)"'
        sd_pattern = r'sd_src:"(.+?)"'
        
        # Try HD quality first
        hd_match = re.search(hd_pattern, response.text)
        if hd_match:
            video_url = hd_match.group(1)
        else:
            # If HD not available, try SD quality
            sd_match = re.search(sd_pattern, response.text)
            if sd_match:
                video_url = sd_match.group(1)
        
        if not video_url:
            raise Exception("Could not find video URL")

        # Generate filename from timestamp if none provided
        filename = f"facebook_video_{int(time.time())}.mp4" # type: ignore
        full_path = os.path.join(save_path, filename)

        # Download the video
        print("Starting download...")
        video_response = requests.get(video_url, stream=True)
        video_response.raise_for_status()
        
        # Write the video file
        with open(full_path, 'wb') as f:
            for chunk in video_response.iter_content(chunk_size=1024*1024):
                if chunk:
                    f.write(chunk)
        
        print(f"Video successfully downloaded to: {full_path}")
        return True

    except requests.exceptions.RequestException as e:
        print(f"Network error occurred: {e}")
        return False
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

def main():
    import time
    
    while True:
        url = input("Enter Facebook video URL (or 'q' to quit): ")
        
        if url.lower() == 'q':
            break
            
        if not url:
            print("Please enter a valid URL")
            continue
            
        custom_path = input("Enter save path (press Enter for default 'downloads' folder): ")
        save_path = custom_path if custom_path else 'downloads'
        
        print("Downloading video...")
        success = download_facebook_video(url, save_path)
        
        if success:
            print("Download completed!")
        else:
            print("Download failed. Please try again with a different URL.")
        
        print("\n" + "="*50 + "\n")

if __name__ == "__main__":
    main()
