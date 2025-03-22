import React, { useEffect, useState, useRef } from "react";
import MinimapOverlay from "./MinimapOverlay";
import useCanvasInteraction from "../hooks/useCanvasInteraction";

/**
 * Canvas component for rendering the simulation with high-DPI support,
 * panning, zooming, and organism selection
 */
const SimulationCanvas = ({
  canvasRef,
  organismPositions = [],
  foodPositions = [],
  onOrganismSelect = null,
  selectionEnabled = true,
  minScale = 0.5,
  maxScale = 2.0,
  defaultScale = 1.0,
}) => {
  // Get device pixel ratio for high-DPI rendering
  const [pixelRatio] = useState(() =>
    Math.min(1.5, window.devicePixelRatio || 1)
  );

  // Viewport container ref
  const containerRef = useRef(null);

  // Use the canvas interaction hook
  const {
    viewportOffset,
    scale,
    setScale,
    resetViewport,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useCanvasInteraction({
    canvasRef,
    containerRef,
    minScale,
    maxScale,
    defaultScale,
    onSelect: onOrganismSelect,
    selectionEnabled,
  });

  // Resize canvas on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;

      const canvas = canvasRef.current;
      const container = containerRef.current;
      const ctx = canvas.getContext("2d");

      // Update canvas size to match container size
      const displayWidth = container.clientWidth;
      const displayHeight = container.clientHeight;

      // Set the canvas dimensions accounting for device pixel ratio
      canvas.width = displayWidth * pixelRatio;
      canvas.height = displayHeight * pixelRatio;

      // Apply viewport transform to context if needed
      if (ctx) {
        // Reset transform
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Apply DPI scaling
        ctx.scale(pixelRatio, pixelRatio);

        // Apply viewport transform
        ctx.translate(viewportOffset.x, viewportOffset.y);
        ctx.scale(scale, scale);

        // Store viewport info on context
        ctx.pixelRatio = pixelRatio;
        ctx.viewportOffset = viewportOffset;
        ctx.viewportScale = scale;
      }
    };

    // Initial setup
    handleResize();

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [viewportOffset, scale, pixelRatio]);

  return (
    <div
      ref={containerRef}
      className="simulation-canvas-container"
      style={{
        width: "100%",
        height: "70vh",
        minHeight: "400px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          cursor: selectionEnabled ? "pointer" : "grab",
        }}
        className="simulation-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Pass entity positions to minimap overlay */}
      <MinimapOverlay
        canvasRef={canvasRef}
        viewportOffset={viewportOffset}
        viewportScale={scale}
        organismPositions={organismPositions}
        foodPositions={foodPositions}
      />

      {/* Viewport controls */}
      <div className="viewport-controls">
        <button onClick={() => scale < maxScale && setScale(scale + 0.1)}>
          +
        </button>
        <button onClick={() => scale > minScale && setScale(scale - 0.1)}>
          -
        </button>
        <button onClick={resetViewport} style={{ fontSize: "1rem" }}>
          ↺
        </button>
      </div>
    </div>
  );
};

export default SimulationCanvas;
