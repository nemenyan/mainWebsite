const links = document.querySelectorAll(".tab-link");
const panes = document.querySelectorAll(".tab-pane");

links.forEach(link => {
  link.addEventListener("click", () => {
    links.forEach(l => l.classList.remove("active"));
    panes.forEach(pane => pane.classList.remove("active"));

    link.classList.add("active");
    document.getElementById(link.dataset.tab).classList.add("active");
  });
});
//
document.addEventListener("click", (e) => {
  const menu = document.querySelector(".menu");
  const checkbox = document.querySelector("#menu-open");

  if (!menu.contains(e.target)) {
    checkbox.checked = false;
  }
});

// Select only the FAQ questions
let faqQuestions = document.querySelectorAll("#faq .question");

faqQuestions.forEach(question => {
  question.addEventListener("click", event => {
    const active = document.querySelector("#faq .question.active");
    if(active && active !== question ) {
      active.classList.toggle("active");
      active.nextElementSibling.style.maxHeight = 0;
    }
    question.classList.toggle("active");
    const answer = question.nextElementSibling;
    if(question.classList.contains("active")){
      answer.style.maxHeight = answer.scrollHeight + "px";
    } else {
      answer.style.maxHeight = 0;
    }
  });
});

//OCS CONTENT

const track = document.querySelector(".carousel-track");
const cards = Array.from(track.children);
const nextButton = document.querySelector(".carousel-button.next");
const prevButton = document.querySelector(".carousel-button.prev");
const container = document.querySelector(".carousel-container");
const indicators = document.querySelectorAll(".indicator");

let currentIndex = 0;
let cardWidth = cards[0].offsetWidth;
let cardMargin = parseInt(window.getComputedStyle(cards[0]).marginRight) * 2;

// Debounce function
function debounce(func, wait, immediate) {
	var timeout;
	return function () {
		var context = this,
			args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

// Initialize carousel
function initializeCarousel() {
	cardWidth = cards[0].offsetWidth;
	cardMargin = parseInt(window.getComputedStyle(cards[0]).marginRight) * 2;

	// Center the initial card
	const initialOffset = container.offsetWidth / 2 - cardWidth / 2;
	track.style.transform = `translateX(${initialOffset}px)`;
	updateCarousel();
}

// Update carousel state
function updateCarousel() {
	// Update card classes
	cards.forEach((card, index) => {
		card.classList.remove(
			"is-active",
			"is-prev",
			"is-next",
			"is-far-prev",
			"is-far-next"
		);

		if (index === currentIndex) {
			card.classList.add("is-active");
		} else if (index === currentIndex - 1) {
			card.classList.add("is-prev");
		} else if (index === currentIndex + 1) {
			card.classList.add("is-next");
		} else if (index < currentIndex - 1) {
			card.classList.add("is-far-prev");
		} else if (index > currentIndex + 1) {
			card.classList.add("is-far-next");
		}
	});

	// Update indicators
	indicators.forEach((indicator, index) => {
		indicator.classList.toggle("active", index === currentIndex);
	});
}

// Move to a specific slide
function moveToSlide(targetIndex) {
	if (targetIndex < 0 || targetIndex >= cards.length) {
		return; // Prevent moving out of bounds
	}

	const amountToMove = targetIndex * (cardWidth + cardMargin);
	const containerCenter = container.offsetWidth / 2;
	const cardCenter = cardWidth / 2;
	const targetTranslateX = containerCenter - cardCenter - amountToMove;

	track.style.transform = `translateX(${targetTranslateX - 25}px)`;
	currentIndex = targetIndex;
	updateCarousel();

	// Add a subtle flash effect to simulate a hi-tech transition
	const flashEffect = document.createElement("div");
	flashEffect.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(56, 189, 248, 0.1);
                z-index: 30;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
            `;
	container.appendChild(flashEffect);

	setTimeout(() => {
		flashEffect.style.opacity = "0.3";
		setTimeout(() => {
			flashEffect.style.opacity = "0";
			setTimeout(() => {
				container.removeChild(flashEffect);
			}, 200);
		}, 100);
	}, 10);
}

// Event Listeners
nextButton.addEventListener("click", () => {
	const nextIndex = currentIndex + 1;
	if (nextIndex < cards.length) {
		moveToSlide(nextIndex);
	}
});

prevButton.addEventListener("click", () => {
	const prevIndex = currentIndex - 1;
	if (prevIndex >= 0) {
		moveToSlide(prevIndex);
	}
});

// Indicator clicks
indicators.forEach((indicator, index) => {
	indicator.addEventListener("click", () => {
		moveToSlide(index);
	});
});

// Swipe Functionality
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;

track.addEventListener("mousedown", dragStart);
track.addEventListener("touchstart", dragStart, { passive: true });

track.addEventListener("mousemove", drag);
track.addEventListener("touchmove", drag, { passive: true });

track.addEventListener("mouseup", dragEnd);
track.addEventListener("mouseleave", dragEnd);
track.addEventListener("touchend", dragEnd);

function dragStart(event) {
	isDragging = true;
	startPos = getPositionX(event);

	// Get current transform value
	const transformMatrix = window
		.getComputedStyle(track)
		.getPropertyValue("transform");
	if (transformMatrix !== "none") {
		currentTranslate = parseInt(transformMatrix.split(",")[4]);
	} else {
		currentTranslate = 0;
	}
	prevTranslate = currentTranslate;
	track.style.transition = "none";
	animationID = requestAnimationFrame(animation);
	track.style.cursor = "grabbing";
}

function drag(event) {
	if (isDragging) {
		const currentPosition = getPositionX(event);
		const moveX = currentPosition - startPos;
		currentTranslate = prevTranslate + moveX;
	}
}

function animation() {
	if (!isDragging) return;
	track.style.transform = `translateX(${currentTranslate}px)`;
	requestAnimationFrame(animation);
}

function dragEnd() {
	if (!isDragging) return;

	cancelAnimationFrame(animationID);
	isDragging = false;
	const movedBy = currentTranslate - prevTranslate;
	track.style.transition = "transform 0.75s cubic-bezier(0.21, 0.61, 0.35, 1)";
	track.style.cursor = "grab";

	// Determine whether to snap to next/prev slide
	const threshold = cardWidth / 3.5; // Less distance needed to trigger slide change

	if (movedBy < -threshold && currentIndex < cards.length - 1) {
		moveToSlide(currentIndex + 1);
	} else if (movedBy > threshold && currentIndex > 0) {
		moveToSlide(currentIndex - 1);
	} else {
		moveToSlide(currentIndex); // Snap back
	}
}

function getPositionX(event) {
	return event.type.includes("mouse") ? event.pageX : event.touches[0].clientX;
}

// Keyboard navigation
document.addEventListener("keydown", (e) => {
	if (e.key === "ArrowRight" || e.key === "ArrowDown") {
		if (currentIndex < cards.length - 1) {
			moveToSlide(currentIndex + 1);
		}
	} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
		if (currentIndex > 0) {
			moveToSlide(currentIndex - 1);
		}
	}
});

// Window resize handler
window.addEventListener(
	"resize",
	debounce(() => {
		initializeCarousel();
		moveToSlide(currentIndex);
	}, 250)
);

// Add automatic card hover effects
cards.forEach((card) => {
	// Create glitch effect on hover
	card.addEventListener("mouseenter", function () {
		if (!card.classList.contains("is-active")) return;

		// Create glitch animation
		const glitchEffect = () => {
			if (!card.matches(":hover") || !card.classList.contains("is-active")) return;

			// Random offset
			const xOffset = Math.random() * 4 - 2;
			const yOffset = Math.random() * 4 - 2;

			card.style.transform = `scale(1) translate(${xOffset}px, ${yOffset}px)`;

			// Random color channel shift
			const r = Math.random() * 10 - 5;
			const g = Math.random() * 10 - 5;
			const b = Math.random() * 10 - 5;

			card.style.boxShadow = `
                        ${r}px 0 0 rgba(255, 0, 0, 0.2),
                        ${g}px 0 0 rgba(0, 255, 0, 0.2),
                        ${b}px 0 0 rgba(0, 0, 255, 0.2),
                        0 15px 25px rgba(0, 0, 0, 0.5),
                        0 0 40px var(--glow-primary)
                    `;

			// Reset after short time
			setTimeout(() => {
				if (!card.matches(":hover") || !card.classList.contains("is-active"))
					return;
				// card.style.transform = 'scale(1)';
				card.style.boxShadow =
					"0 15px 25px rgba(0, 0, 0, 0.5), 0 0 40px var(--glow-primary)";
			}, 50);

			// Continue effect randomly while hovering
			if (Math.random() > 0.7) {
				setTimeout(glitchEffect, Math.random() * 1000 + 500);
			}
		};

		// Start glitch effect chain
		setTimeout(glitchEffect, 500);
	});

	// Reset styles on mouse leave
	card.addEventListener("mouseleave", function () {
		if (card.classList.contains("is-active")) {
			card.style.boxShadow =
				"0 15px 25px rgba(0, 0, 0, 0.5), 0 0 40px var(--glow-primary)";
		}
	});
});

// Add HUD scanning animation to active card
function animateActiveCard() {
	const activeCard = document.querySelector(".carousel-card.is-active");
	if (!activeCard) return;

	// Add scanning line effect
	const scanLine = document.createElement("div");
	scanLine.style.cssText = `
                position: absolute;
                left: 0;
                top: 0;
                height: 2px;
                width: 100%;
                background: linear-gradient(90deg, 
                    transparent, 
                    rgba(56, 189, 248, 0.8), 
                    rgba(56, 189, 248, 0.8), 
                    transparent
                );
                opacity: 0.7;
                z-index: 10;
                pointer-events: none;
                animation: scanAnimation 2s ease-in-out;
            `;

	// Define animation
	const style = document.createElement("style");
	style.textContent = `
                @keyframes scanAnimation {
                    0% { top: 0; }
                    75% { top: calc(100% - 2px); }
                    100% { top: calc(100% - 2px); opacity: 0; }
                }
            `;
	document.head.appendChild(style);

	// Add to active card and remove when animation completes
	const imageContainer = activeCard.querySelector(".card-image-container");
	imageContainer.appendChild(scanLine);

	setTimeout(() => {
		imageContainer.removeChild(scanLine);
	}, 2000);
}

// Add data counter animation effect
function animateDataCounter() {
	const activeCard = document.querySelector(".carousel-card.is-active");
	if (!activeCard) return;

	const statsElement = activeCard.querySelector(".card-stats");
	const completionText = statsElement.lastElementChild.textContent;
	const percentageMatch = completionText.match(/(\d+)%/);

	if (percentageMatch) {
		const targetPercentage = parseInt(percentageMatch[1]);
		let currentPercentage = 0;

		statsElement.lastElementChild.textContent = "0% COMPLETE";

		const interval = setInterval(() => {
			currentPercentage += Math.ceil(targetPercentage / 15);

			if (currentPercentage >= targetPercentage) {
				currentPercentage = targetPercentage;
				clearInterval(interval);
			}

			statsElement.lastElementChild.textContent = `${currentPercentage}% COMPLETE`;
		}, 50);

		// Also animate progress bar
		const progressBar = activeCard.querySelector(".progress-value");
		progressBar.style.width = "0%";

		setTimeout(() => {
			progressBar.style.transition =
				"width 0.8s cubic-bezier(0.17, 0.67, 0.83, 0.67)";
			progressBar.style.width = `${targetPercentage}%`;
		}, 100);
	}
}

// Update active card when changed
function handleCardActivation() {
	animateActiveCard();
	animateDataCounter();

	// Reset progress bar transition after animation completes
	setTimeout(() => {
		const progressBars = document.querySelectorAll(".progress-value");
		progressBars.forEach((bar) => {
			bar.style.transition = "none";
		});
	}, 1000);
}

// Add subtle floating animation to all cards
function addFloatingEffect() {
	cards.forEach((card, index) => {
		const delay = index * 0.2;
		card.style.animation = `floating 4s ease-in-out ${delay}s infinite`;
	});

	const floatingKeyframes = `
                @keyframes floating {
                    0% { transform: translateY(0px) rotate3d(0, 1, 0, 0deg); }
                    50% { transform: translateY(-10px) rotate3d(0, 1, 0, 1deg); }
                    100% { transform: translateY(0px) rotate3d(0, 1, 0, 0deg); }
                }
            `;

	const style = document.createElement("style");
	style.textContent = floatingKeyframes;
	document.head.appendChild(style);
}

// Add observer to detect active card changes
let previousActive = null;

// Create a mutation observer to watch for class changes
const observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		if (mutation.attributeName === "class") {
			const target = mutation.target;
			if (target.classList.contains("is-active") && target !== previousActive) {
				previousActive = target;
				handleCardActivation();
			}
		}
	});
});

// Start observing all cards for class changes
cards.forEach((card) => {
	observer.observe(card, { attributes: true });
});

// Add keyboard navigation animation feedback
document.addEventListener("keydown", (e) => {
	if (
		e.key === "ArrowRight" ||
		e.key === "ArrowLeft" ||
		e.key === "ArrowUp" ||
		e.key === "ArrowDown"
	) {
		// Create a brief flash effect on button
		const button =
			e.key === "ArrowRight" || e.key === "ArrowDown" ? nextButton : prevButton;

		button.style.transform = "translateY(-50%) scale(1.2)";
		button.style.boxShadow = "0 0 30px var(--glow-primary)";

		setTimeout(() => {
			button.style.transform = "translateY(-50%) scale(1)";
			button.style.boxShadow = "";
		}, 200);
	}
});

// Add initialization for indicator animations
indicators.forEach((indicator, index) => {
	indicator.addEventListener("click", function () {
		// Add pulse effect when clicked
		this.style.transform = "scale(1.3)";
		this.style.boxShadow = "0 0 15px #38bdf8";

		setTimeout(() => {
			this.style.transform = "";
			this.style.boxShadow = "";
		}, 300);
	});
});

// Initialize everything
window.onload = () => {
	initializeCarousel();

	// Set initial active state
	moveToSlide(2);

	// Start animations with slight delay
	setTimeout(() => {
		// addFloatingEffect();
		handleCardActivation();

		// Add occasional ambient scanning effect
		setInterval(() => {
			if (Math.random() > 0.5) {
				animateActiveCard();
			}
		}, 8000);
	}, 500);
};

// Fix carousel recalculation if OCs tab
links.forEach(link => {
  link.addEventListener("click", () => {
    links.forEach(l => l.classList.remove("active"));
    panes.forEach(pane => pane.classList.remove("active"));

    link.classList.add("active");
    const targetPane = document.getElementById(link.dataset.tab);
    targetPane.classList.add("active");

    
    if (link.dataset.tab === "ocs") {
      setTimeout(() => {
        initializeCarousel();
        moveToSlide(currentIndex);
      }, 50);
    }
  });
});


////
const termsBtn = document.getElementById("termsBtn");
const draggable = document.getElementById("draggableTerms");
const closeBtn = draggable.querySelector(".close-btn");

let isTermsDragging = false;
let termsOffsetX = 0, termsOffsetY = 0;

// Open draggable tab
termsBtn.addEventListener("click", () => {
    draggable.style.display = "block";
});

// Close draggable tab
closeBtn.addEventListener("click", () => {
    draggable.style.display = "none";
});

// Drag start
draggable.querySelector(".modal-header").addEventListener("mousedown", (e) => {
    isTermsDragging = true;
    termsOffsetX = e.clientX - draggable.offsetLeft;
    termsOffsetY = e.clientY - draggable.offsetTop;
    draggable.style.cursor = "grabbing";
});

// Drag end
document.addEventListener("mouseup", () => {
    isTermsDragging = false;
    draggable.style.cursor = "grab";
});

// Dragging
document.addEventListener("mousemove", (e) => {
    if (!isTermsDragging) return;
    draggable.style.left = (e.clientX - termsOffsetX) + "px";
    draggable.style.top = (e.clientY - termsOffsetY) + "px";
});

// projects button sound effect
const buttons = document.querySelectorAll('.projects-item .btn-content');
const clickSound = document.getElementById('buttonClickSound');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    clickSound.currentTime = 0; 
    clickSound.play();
  });
});
