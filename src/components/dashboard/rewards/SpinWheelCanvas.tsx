import React, { useEffect, useRef } from "react";
import { WheelSegment } from "@/lib/api/dashboard-apis/rewardsApis";

interface SpinWheelCanvasProps {
  segments: WheelSegment[];
  isSpinning: boolean;
  targetIndex: number | null;
  onSpinComplete: () => void;
}

const DEFAULT_COLORS = [
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#14B8A6", // Teal
  "#F97316", // Orange
];

export const SpinWheelCanvas: React.FC<SpinWheelCanvasProps> = ({
  segments,
  isSpinning,
  targetIndex,
  onSpinComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentRotationRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startRotationRef = useRef<number>(0);
  const targetRotationRef = useRef<number>(0);

  const numSegments = segments.length || 1;
  const segmentAngle = (2 * Math.PI) / numSegments;

  // Draw wheel on canvas
  const drawWheel = (rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 24;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    // Draw slices
    segments.forEach((segment, i) => {
      const angle = i * segmentAngle;
      const nextAngle = angle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, nextAngle);
      ctx.closePath();

      // Slice color with subtle radial gradient
      const color = segment.displayColor || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      const grad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
      grad.addColorStop(0, color);
      grad.addColorStop(1, shadeColor(color, -20));
      ctx.fillStyle = grad;
      ctx.fill();

      // Slice border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw slice text
      ctx.save();
      ctx.rotate(angle + segmentAngle / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 4;
      ctx.font = "bold 13px 'Plus Jakarta Sans', Inter, sans-serif";

      // Truncate label if too long
      const label = segment.label || `₦${segment.rewardValue}`;
      const displayText = label.length > 14 ? label.slice(0, 12) + "…" : label;
      ctx.fillText(displayText, radius - 16, 0);

      ctx.restore();
    });

    // Outer decorative rim
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#FBBF24"; // Gold rim
    ctx.lineWidth = 6;
    ctx.shadowColor = "rgba(251, 191, 36, 0.4)";
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Decorative bulb dots around the rim
    const dotCount = Math.max(numSegments * 2, 16);
    for (let i = 0; i < dotCount; i++) {
      const dotAngle = (i * 2 * Math.PI) / dotCount;
      const dotX = Math.cos(dotAngle) * (radius + 2);
      const dotY = Math.sin(dotAngle) * (radius + 2);

      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? "#FFFBEB" : "#F59E0B";
      ctx.fill();
    }

    ctx.restore(); // Restore center rotation

    // Center Hub (Fixed gloss cap)
    ctx.save();
    ctx.translate(centerX, centerY);

    // Hub outer shadow
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, 2 * Math.PI);
    ctx.fillStyle = "#1E1B4B";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 8;
    ctx.fill();

    // Hub inner ring
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, 2 * Math.PI);
    const hubGrad = ctx.createLinearGradient(-22, -22, 22, 22);
    hubGrad.addColorStop(0, "#F59E0B");
    hubGrad.addColorStop(1, "#D97706");
    ctx.fillStyle = hubGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    // Center icon/text
    ctx.fillStyle = "#1E1B4B";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★", 0, 0);

    ctx.restore();
  };

  // Helper function to darken/lighten hex colors
  const shadeColor = (color: string, percent: number) => {
    let num = parseInt(color.replace("#", ""), 16);
    if (isNaN(num)) return color;
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = ((num >> 8) & 0x00ff) + amt;
    let B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  };

  // Handle spin animation
  useEffect(() => {
    if (isSpinning && targetIndex !== null) {
      // Calculate stop angle
      // Top pointer is at -Math.PI / 2 (or 270 deg / 12 o'clock)
      // To land targetIndex under top pointer:
      // rotation + (targetIndex + 0.5) * segmentAngle = 3 * Math.PI / 2 (mod 2PI)
      const targetWedgeCenter = (targetIndex + 0.5) * segmentAngle;
      const pointerAngle = (3 * Math.PI) / 2; // 12 o'clock position
      let desiredFinalAngle = pointerAngle - targetWedgeCenter;

      // Add 5 to 7 full rotations (10pi - 14pi) for exciting spin
      const fullRotations = 6 * (2 * Math.PI);
      const totalDelta = fullRotations + ((desiredFinalAngle - (currentRotationRef.current % (2 * Math.PI)) + 4 * Math.PI) % (2 * Math.PI));

      startRotationRef.current = currentRotationRef.current;
      targetRotationRef.current = currentRotationRef.current + totalDelta;
      startTimeRef.current = null;

      const DURATION = 4500; // 4.5 seconds

      // Cubic-bezier ease-out easing
      const easeOutCubic = (t: number): number => {
        return 1 - Math.pow(1 - t, 3.5);
      };

      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / DURATION, 1);
        const easedProgress = easeOutCubic(progress);

        const currentRot =
          startRotationRef.current +
          (targetRotationRef.current - startRotationRef.current) * easedProgress;

        currentRotationRef.current = currentRot;
        drawWheel(currentRot);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          currentRotationRef.current = targetRotationRef.current;
          drawWheel(targetRotationRef.current);
          onSpinComplete();
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } else {
      drawWheel(currentRotationRef.current);
    }
  }, [isSpinning, targetIndex, segments]);

  // Initial draw & resize
  useEffect(() => {
    drawWheel(currentRotationRef.current);
  }, [segments]);

  return (
    <div className="relative flex items-center justify-center p-2">
      {/* Top Needle / Pointer Indicator */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none drop-shadow-md">
        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-400 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
        <div className="size-3.5 -mt-6 rounded-full bg-amber-200 border-2 border-amber-600 shadow-inner" />
      </div>

      {/* Wheel Canvas */}
      <canvas
        ref={canvasRef}
        width={360}
        height={360}
        className="w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] select-none rounded-full shadow-[0_10px_35px_-5px_rgba(0,0,0,0.3)]"
      />
    </div>
  );
};
