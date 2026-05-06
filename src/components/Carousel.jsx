import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin"; // Ensure this is available if using GSAP Premium, otherwise standard inertia works
import "./Carousel.css";

gsap.registerPlugin(Draggable);

const Carousel = () => {
  const containerRef = useRef(null);
  const carouselRef = useRef(null);
  const proxyRef = useRef(document.createElement("div"));

  const config = {
    total: 12, // Increased for a fuller circle
    rotationSpeed: 60,
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    const container = containerRef.current;

    if (!carousel || !container) return;

    // Setting initial rotation to avoid jump
    gsap.set(carousel, { rotateY: 0 });

    const autoRotation = gsap.to(carousel, {
      rotateY: "-=360",
      duration: config.rotationSpeed,
      ease: "none",
      repeat: -1,
    });

    const draggable = Draggable.create(proxyRef.current, {
      type: "x",
      trigger: container,
      inertia: true,
      onPress() {
        autoRotation.pause();
        // Adjust the drag weight for a "satisfying" feel
        this.startRotation = gsap.getProperty(carousel, "rotateY");
      },
      onDrag() {
        // Multiplier (0.5) controls how fast it spins relative to your mouse
        gsap.set(carousel, {
          rotateY: this.startRotation + (this.x * 0.5),
        });
      },
      onThrowUpdate() {
        gsap.set(carousel, {
          rotateY: this.startRotation + (this.x * 0.5),
        });
      },
      onRelease() {
        // Resume after 2 seconds of inactivity
        gsap.delayedCall(2, () => autoRotation.play());
      },
    })[0];

    return () => {
      autoRotation.kill();
      draggable.kill();
    };
  }, []);

  return (
    <section className="carousel-section" ref={containerRef}>
      <div className="carousel-container">
        <ul className="carousel" ref={carouselRef} style={{ "--total": config.total }}>
          {[...Array(config.total)].map((_, i) => (
            <li key={i} style={{ "--index": i }}>
              <img src={`https://picsum.photos/600/600?random=${i}`} alt={`Project ${i}`} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Carousel;