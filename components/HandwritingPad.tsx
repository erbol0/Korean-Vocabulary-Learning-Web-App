"use client";

import React, { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number; t: number };
type Stroke = Point[];
export type Drawing = Stroke[];

interface HandwritingPadProps {
  width?: number;
  height?: number;
  onChange?: (drawing: Drawing) => void;
  templateText?: string;
  showTemplate?: boolean;
}

export function HandwritingPad({
  width = 320,
  height = 320,
  onChange,
  templateText = "",
  showTemplate = true
}: HandwritingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const templateCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState<Drawing>([]);
  const isDown = useRef(false);
  const curStroke = useRef<Stroke>([]);

  // Render template (chữ mờ)
  useEffect(() => {
    if (!showTemplate || !templateText) return;
    const canvas = templateCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear và set background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(248, 250, 252, 0.9)";
    ctx.fillRect(0, 0, width, height);

    // Vẽ chữ template mờ
    ctx.font = `${Math.min(width, height) * 0.6}px system-ui, -apple-system, "Noto Sans KR", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(148, 163, 184, 0.3)"; // slate-400 với opacity thấp
    ctx.fillText(templateText, width / 2, height / 2);

    // Border template
    ctx.strokeStyle = "rgba(203, 213, 225, 0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(0, 0, width, height);
    ctx.setLineDash([]);
  }, [templateText, showTemplate, width, height]);

  function redraw(d: Drawing) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas (transparent để nhìn thấy template bên dưới)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ strokes của user
    ctx.strokeStyle = "#1e293b"; // slate-800
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const stroke of d) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    }
  }

  useEffect(() => {
    redraw(drawing);
    onChange?.(drawing);
  }, [drawing, onChange]);

  function getPos(e: PointerEvent): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      t: Date.now()
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    const canvas = e.target as HTMLCanvasElement;
    canvas.setPointerCapture(e.pointerId);
    isDown.current = true;
    
    const point = getPos(e.nativeEvent);
    curStroke.current = [point];
    setDrawing(d => [...d, curStroke.current]);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDown.current) return;
    
    const point = getPos(e.nativeEvent);
    curStroke.current.push(point);
    
    setDrawing(d => {
      const newDrawing = d.slice();
      newDrawing[newDrawing.length - 1] = curStroke.current.slice();
      return newDrawing;
    });
  }

  function onPointerUp() {
    isDown.current = false;
  }

  function undo() {
    setDrawing(d => d.slice(0, -1));
  }

  function clear() {
    setDrawing([]);
  }

  return (
    <div className="space-y-4">
      <div 
        className="relative rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm"
        style={{ width, height }}
      >
        {/* Template canvas (background) */}
        <canvas
          ref={templateCanvasRef}
          width={width}
          height={height}
          className="absolute inset-0"
        />
        
        {/* User drawing canvas (foreground) */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="absolute inset-0 touch-none cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onContextMenu={(e) => e.preventDefault()} // Ngăn right-click menu trên mobile
        />
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={undo}
          disabled={drawing.length === 0}
          className="px-4 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-medium hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ↶ Undo
        </button>
        <button
          onClick={clear}
          disabled={drawing.length === 0}
          className="px-4 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-medium hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ✕ Clear
        </button>
      </div>
    </div>
  );
}