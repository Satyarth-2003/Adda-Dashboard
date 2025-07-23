import webvtt
import sys
import os

def parse_vtt_file(vtt_file):
    try:
        # Check if file exists
        if not os.path.exists(vtt_file):
            print(f"Error: File '{vtt_file}' not found.")
            return None
            
        # Parse the VTT file
        captions = webvtt.read(vtt_file)
        
        # Extract and format the captions
        formatted_captions = []
        for i, caption in enumerate(captions):
            # Clean up the text (remove extra whitespace, newlines, etc.)
            text = ' '.join(line.strip() for line in caption.text.splitlines() if line.strip())
            if text:  # Only include non-empty captions
                formatted_captions.append({
                    'index': i + 1,
                    'start': caption.start,
                    'end': caption.end,
                    'text': text
                })
        
        return formatted_captions
        
    except Exception as e:
        print(f"Error parsing VTT file: {str(e)}")
        return None

def print_transcript(captions, max_lines=20):
    if not captions:
        print("No captions to display.")
        return
        
    print(f"\nTranscript ({len(captions)} entries):")
    print("=" * 80)
    
    # Print the first few lines
    for i, caption in enumerate(captions[:max_lines]):
        print(f"{caption['index']:4d}. [{caption['start']} --> {caption['end']}] {caption['text']}")
    
    # If there are more lines, show a summary
    if len(captions) > max_lines:
        print(f"\n... and {len(captions) - max_lines} more entries")
    
    print("=" * 80)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parse_vtt.py <path_to_vtt_file> [max_lines]")
        print("Example: python parse_vtt.py 'Current Affairs Today ｜ 23 July Current Affairs 2025 ｜ Daily Current Affairs By Ashutosh Sir [-PAD2MYt0B0].hi.vtt' 20")
        sys.exit(1)
    
    vtt_file = sys.argv[1]
    max_lines = int(sys.argv[2]) if len(sys.argv) > 2 else 20
    
    print(f"Parsing VTT file: {vtt_file}")
    captions = parse_vtt_file(vtt_file)
    
    if captions:
        print_transcript(captions, max_lines)
        
        # Save the formatted transcript to a text file
        output_file = os.path.splitext(vtt_file)[0] + ".txt"
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(f"Transcript from: {os.path.basename(vtt_file)}\n")
                f.write("=" * 80 + "\n\n")
                
                for caption in captions:
                    f.write(f"[{caption['start']} --> {caption['end']}]\n")
                    f.write(f"{caption['text']}\n\n")
                    
            print(f"\nTranscript saved to: {output_file}")
        except Exception as e:
            print(f"Error saving transcript to file: {str(e)}")
