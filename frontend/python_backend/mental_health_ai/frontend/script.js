function typeEffect(text, element) {
    let i = 0;
    function typing() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, 15);
        }
    }
    typing();
}

function addMessage(text, sender) {
    let chatBox = document.getElementById("chat-box");

    let msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);

    chatBox.appendChild(msgDiv);

    if (sender === "bot") {
        typeEffect(text, msgDiv);
    } else {
        msgDiv.innerHTML = text;
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMsg() {
    try {
        let input = document.getElementById("msg");
        let msg = input.value;

        if (msg.trim() === "") return;

        addMessage(msg, "user");
        input.value = "";

        let res = await fetch("http://127.0.0.1:8000/chat", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                user_id: "user1",
                message: msg
            })
        });

        let data = await res.json();

        addMessage(data.response, "bot");

    } catch (error) {
        console.error(error);
        alert("Error connecting to backend");
    }
}