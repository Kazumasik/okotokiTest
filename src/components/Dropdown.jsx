import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./components.module.css";
import { useClickOutside } from "../lib/hooks";

const Dropdown = ({ triggerRef, children, onOpenChange, isOpen: open, offset = 0, ...props }) => {
  const [isOpen, setIsOpen] = useState(open);
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = () => {
    const triggerRect = triggerRef.current?.getBoundingClientRect();
    if (triggerRect) {
      setPosition({
        top: triggerRect.bottom + window.scrollY,
        left: triggerRect.right + window.scrollX,
      });
    }
  };

  const handleClickOutside = () => setIsOpen(false);

  useClickOutside(handleClickOutside, dropdownRef, triggerRef);

  const handleTriggerClick = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (trigger) {
      trigger.addEventListener("click", handleTriggerClick);
    }
    return () => {
      if (trigger) {
        trigger.removeEventListener("click", handleTriggerClick);
      }
    };
  }, [triggerRef]);

  useEffect(() => {
    updatePosition();
    onOpenChange(isOpen);
    const handleResizeOrScroll = () => {
      if (isOpen) {
        updatePosition();
      }
    };
    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll);
    return () => {
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll);
    };
  }, [isOpen]);

  const dropdownStyle = {
    position: "absolute",
    top: position.top + offset,
    left: position.left,
    transform: "translateX(-100%)",
    zIndex: 1000,
  };

  if (!isOpen) return null;

  return createPortal(
    <div ref={dropdownRef} className={`${styles.dropdown} glassBg`} style={dropdownStyle} {...props}>
      {children}
    </div>,
    document.body
  );
};

export default Dropdown;
