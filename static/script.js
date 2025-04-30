let historyStack = [];
let selectedNumber1 = null;
let selectedOperator = null;

function saveHistory() {
    const snapshot = [];
    const slots = document.querySelectorAll(".number-slot");
    slots.forEach((slot, index) => {
        const number = slot.querySelector(".number");
        if (number) {
            snapshot.push({ index: index, value: number.innerText });
        } else {
            snapshot.push(null);  // Save empty slots too!
        }
    });
    historyStack.push(snapshot);
}

function selectNumber(el) {
    if (!selectedNumber1) {
        el.classList.add("selected");
        selectedNumber1 = el;
    } else if (el === selectedNumber1) {
        el.classList.remove("selected");
        selectedNumber1 = null;
    } else if (selectedOperator) {
        const num1 = parseInt(selectedNumber1.innerText);
        const num2 = parseInt(el.innerText);
        let result = null;

        switch (selectedOperator.innerText) {
            case '+': result = num1 + num2; break;
            case '−': result = num1 - num2; break;
            case '×': result = num1 * num2; break;
            case '÷':
                if (num2 === 0 || num1 % num2 !== 0) {
                    result = (num2 === 0) ? "÷" : (num1 + "÷" + num2);
                } else {
                    result = num1 / num2;
                }
                break;
        }

        // 🚫 Handle invalid move
        if (typeof result === "string" || result <= 0) {
            const index1 = Array.from(document.querySelectorAll(".number-slot")).indexOf(selectedNumber1.parentElement);
            const index2 = Array.from(document.querySelectorAll(".number-slot")).indexOf(el.parentElement);
            const original1 = selectedNumber1.innerText;
            const original2 = el.innerText;

            selectedNumber1.remove();
            el.innerText = result;
            el.classList.add("invalid-result");

            setTimeout(() => {
                const slots = document.querySelectorAll(".number-slot");

                const newNum1 = document.createElement("div");
                newNum1.className = "number";
                newNum1.innerText = original1;
                newNum1.onclick = () => selectNumber(newNum1);
                slots[index1].appendChild(newNum1);

                el.innerText = original2;
                el.classList.remove("invalid-result");

                // 🔄 Reset selection state
                if (selectedNumber1) selectedNumber1.classList.remove("selected");
                if (selectedOperator) selectedOperator.classList.remove("selected");
                selectedNumber1 = null;
                selectedOperator = null;
            }, 1250);

            return;
        }

        // ✅ Valid move
        saveHistory();
        el.innerText = result;
        selectedNumber1.remove();

        // 🧠 Trigger win check after DOM update
        setTimeout(() => {
            checkWinCondition();
        }, 0);

        // 🔄 Reset selection state
        if (selectedNumber1) selectedNumber1.classList.remove("selected");
        if (selectedOperator) selectedOperator.classList.remove("selected");
        selectedNumber1 = null;
        selectedOperator = null;
    }
}

function selectOperator(el) {
    if (selectedOperator === el) {
        el.classList.remove("selected");
        selectedOperator = null;
    } else {
        if (selectedOperator) {
            selectedOperator.classList.remove("selected");
        }
        el.classList.add("selected");
        selectedOperator = el;
    }
}

function checkWinCondition() {
    const numbers = document.querySelectorAll(".number");
    if (numbers.length === 1 && parseInt(numbers[0].innerText) === 24) {
        showWinMessage();
    }
}

function showWinMessage() {
    if (document.getElementById("win-message")) return;

    const message = document.createElement("div");
    message.innerText = "🎉 You made 24!";
    message.id = "win-message";
    message.style.position = "absolute";
    message.style.top = "50%";
    message.style.left = "50%";
    message.style.transform = "translate(-50%, -50%)";
    message.style.fontSize = "42px";
    message.style.fontWeight = "bold";
    message.style.color = "#6b5bff";
    message.style.textShadow = "2px 2px 8px rgba(107, 91, 255, 0.6)";
    document.body.appendChild(message);

    // ✅ Safely trigger confetti
    setTimeout(() => {
        if (typeof confetti === "function") {
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 },
            });
        } else {
            console.warn("⚠️ Confetti function not available.");
        }
    }, 100); // short delay ensures DOM is ready
}

function undoMove() {
    if (historyStack.length === 0) return;

    const previous = historyStack.pop();
    const slots = document.querySelectorAll(".number-slot");

    // Clear current numbers
    slots.forEach(slot => {
        const number = slot.querySelector(".number");
        if (number) number.remove();
    });

    // Restore numbers based on previous snapshot
    previous.forEach(item => {
        if (item) {
            const div = document.createElement("div");
            div.className = "number";
            div.innerText = item.value;
            div.onclick = () => selectNumber(div);
            slots[item.index].appendChild(div);
        }
    });

    selectedNumber1 = null;
    if (selectedOperator) {
        selectedOperator.classList.remove("selected");
        selectedOperator = null;
    }

    const winMsg = document.getElementById("win-message");
    if (winMsg) winMsg.remove();
}

function checkIfSolvable() {
    const nums = Array.from(document.querySelectorAll(".number")).map(n => parseInt(n.innerText));

    fetch("/check_solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers: nums })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.solution_exists) {
            showNoSolutionBanner();
        } else {
            alert("✅ A solution exists!");
        }
    });
}

function showNoSolutionBanner() {
    if (document.getElementById("no-solution-banner")) return;

    const banner = document.createElement("div");
    banner.id = "no-solution-banner";
    banner.innerText = "🚫 No Solution";
    banner.style.marginTop = "20px";
    banner.style.color = "#ff4444";
    banner.style.fontSize = "24px";
    banner.style.fontWeight = "bold";
    banner.style.animation = "fadeInBounce 0.5s ease";
    document.body.appendChild(banner);
}
window.addEventListener('load', () => {
    console.log("Confetti available?", typeof confetti);
  });