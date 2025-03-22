import { useEffect, useRef } from 'react';

/**
 * Hook for creating an animation loop
 */
const useAnimationLoop = ({ isActive, onFrame }) => {
  const animationFrameIdRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  
  useEffect(() => {
    if (!isActive) {
      // Cancel animation frame if not active
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      return;
    }
    
    // Animation loop function
    const animate = (time) => {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      
      // Call the onFrame callback with deltaTime
      onFrame(deltaTime);
      
      // Continue the loop
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    
    // Start the animation loop
    lastTimeRef.current = performance.now();
    animationFrameIdRef.current = requestAnimationFrame(animate);
    
    // Cleanup function
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [isActive, onFrame]);
  
  return null;
};

export default useAnimationLoop;