import type { Drawing } from "@/components/HandwritingPad";

export interface HandwritingScore {
  score: number; // 0-100
  feedback: string;
  accuracy: number; // IoU value 0-1
}

/**
 * Normalizes drawing to a standard size and position
 */
function normalizeDrawing(drawing: Drawing, targetWidth: number = 256, targetHeight: number = 256): Drawing {
  if (drawing.length === 0) return [];

  // Find bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  for (const stroke of drawing) {
    for (const point of stroke) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }

  const currentWidth = maxX - minX;
  const currentHeight = maxY - minY;
  
  if (currentWidth === 0 || currentHeight === 0) return drawing;

  // Calculate scale factor to fit target size while maintaining aspect ratio
  const scale = Math.min(targetWidth * 0.8 / currentWidth, targetHeight * 0.8 / currentHeight);
  
  // Calculate offset to center the drawing
  const scaledWidth = currentWidth * scale;
  const scaledHeight = currentHeight * scale;
  const offsetX = (targetWidth - scaledWidth) / 2 - minX * scale;
  const offsetY = (targetHeight - scaledHeight) / 2 - minY * scale;

  // Apply transformation
  return drawing.map(stroke => 
    stroke.map(point => ({
      x: point.x * scale + offsetX,
      y: point.y * scale + offsetY,
      t: point.t
    }))
  );
}

/**
 * Renders user drawing to canvas to produce a bitmap
 */
function renderDrawingToBitmap(drawing: Drawing, width: number, height: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Clear background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  // Draw strokes
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const stroke of drawing) {
    if (stroke.length < 2) continue;
    
    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length; i++) {
      ctx.lineTo(stroke[i].x, stroke[i].y);
    }
    ctx.stroke();
  }

  return ctx.getImageData(0, 0, width, height);
}

/**
 * Renders target template text onto canvas to produce a bitmap
 */
function renderTemplateToBitmap(text: string, width: number, height: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Clear background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  // Draw template text
  const fontSize = Math.min(width, height) * 0.6;
  ctx.font = `${fontSize}px system-ui, -apple-system, "Noto Sans KR", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'black';
  ctx.fillText(text, width / 2, height / 2);

  return ctx.getImageData(0, 0, width, height);
}

/**
 * Calculates IoU (Intersection over Union) between two bitmaps
 */
function calculateIoU(userBitmap: ImageData, templateBitmap: ImageData): number {
  const { data: userData } = userBitmap;
  const { data: templateData } = templateBitmap;
  
  if (userData.length !== templateData.length) return 0;

  let intersection = 0;
  let union = 0;

  // Threshold to classify pixel as ink (non-white)
  const threshold = 240; // Pixels with R/G/B < 240 are considered ink

  for (let i = 0; i < userData.length; i += 4) {
    // Check grayscale value (using R channel since canvas is grayscale)
    const userInk = userData[i] < threshold;
    const templateInk = templateData[i] < threshold;

    if (userInk && templateInk) {
      intersection++;
    }
    if (userInk || templateInk) {
      union++;
    }
  }

  return union === 0 ? 0 : intersection / union;
}

/**
 * Generates feedback based on IoU score and stroke metadata
 */
function generateFeedback(iou: number, drawing: Drawing, templateText: string): string {
  const strokeCount = drawing.length;
  
  if (iou >= 0.7) {
    return "Excellent! Very accurate handwriting. 🎉";
  } else if (iou >= 0.5) {
    return "Great job! The character shape is fairly accurate. ✨";
  } else if (iou >= 0.3) {
    if (strokeCount === 0) {
      return "Please try writing the character on the canvas! 📝";
    } else if (strokeCount < 3) {
      return "Needs a few more strokes to complete the character. ✍️";
    }
    return "Good effort, but try adjusting the character shape slightly. 💪";
  } else if (iou >= 0.1) {
    return "Needs more practice to improve accuracy. 📚";
  } else {
    if (strokeCount === 0) {
      return `Please try writing "${templateText}" on the canvas! 🖊️`;
    }
    return "Try tracing over the template again. Pay attention to stroke placement and proportions. 🎯";
  }
}

/**
 * Main evaluation function: scores handwriting against target text
 */
export function scoreHandwriting(
  drawing: Drawing, 
  templateText: string,
  canvasWidth: number = 320,
  canvasHeight: number = 320
): HandwritingScore {
  const bitmapSize = 256;
  
  try {
    // 1. Normalize drawing
    const normalizedDrawing = normalizeDrawing(drawing, bitmapSize, bitmapSize);
    
    // 2. Render both drawing and template to bitmap
    const userBitmap = renderDrawingToBitmap(normalizedDrawing, bitmapSize, bitmapSize);
    const templateBitmap = renderTemplateToBitmap(templateText, bitmapSize, bitmapSize);
    
    // 3. Calculate IoU
    const iou = calculateIoU(userBitmap, templateBitmap);
    
    // 4. Convert IoU to score (0-100) using a curve to make scoring beginner-friendly
    let score = Math.round(Math.pow(iou, 0.7) * 100);
    score = Math.max(0, Math.min(100, score));
    
    // 5. Generate feedback
    const feedback = generateFeedback(iou, drawing, templateText);
    
    return {
      score,
      feedback,
      accuracy: iou
    };
  } catch (error) {
    console.error("Error scoring handwriting:", error);
    return {
      score: 0,
      feedback: "An error occurred while scoring. Please try again! ⚠️",
      accuracy: 0
    };
  }
}