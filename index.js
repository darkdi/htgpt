const API_KEY = "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";
const API_URL = "https://api.openai.com/v1/chat/completions";

const resultText = document.getElementById("resultText");
const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");
const stopBtn = document.getElementById("stopBtn");


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/*var cookies = document.cookie.split(';');
for (var i =0; i < cookies.length; i++) {
    var cookie = cookies[i].trim();
    if (cookie.indexOf("username") ===1) { // Ищем нужную cookie
break;
    }
    else {
        var date = new Date();
        date.setTime(date.getTime() + (5 *24 *60 *60 *1000));
        document.cookie = 'username=' + getRandomInt(999999999) +'; expires=' + date.toUTCString() + '; path=/';
    }
}*/


if (localStorage.getItem('sessionid') !== null) {
    var flaguser = false;
    sessionStorage.setItem('sessionid', getRandomInt(999999999));
    var usersessionid = sessionStorage.getItem('sessionid');

}
else {
    var flaguser = true;
    var usersessionid = sessionStorage.getItem('sessionid');
    console.log(usersessionid);
}








let controller = null;
const suka = {messages:[]};
const generate = async () => {
    if (!promptInput.value) {
        alert("To generate a response, please enter a prompt.");
        return;
    }

    generateBtn.disabled = true;
    resultText.innerText = "Loading...";

    var catImage = document.createElement('div');
    var chatInput = document.createElement('div');

    var txtInput = promptInput.value;


    catImage.className = "txt";
    chatInput.innerText = txtInput;
    chatInput.className = "inputuser";

    console.log(txtInput);

    promptInput.value = "";


    document.querySelector('#resultContainer').prepend(catImage);
    document.querySelector('#resultContainer').prepend(chatInput);

    stopBtn.disabled = false;

    controller = new AbortController();
    const signal = controller.signal;

    suka.messages.push({role: "user", content: txtInput });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + API_KEY
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: suka.messages,
                stream: true, // enabling streaming feature
                user: "user"+usersessionid,
            }),
            signal
        });

        console.log(suka);
        // inserting response without streaming
        // const data = await response.json();
        // resultText.innerText = data.choices[0].message.content;

        // reading data in a streaming fashion
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf8");
        resultText.innerText = "";
        promptInput.value = "";

        while (true) {
            const chunk = await reader.read();
            const {done, value} = chunk;

            if (done) break;

            const decodedValue = decoder.decode(value);
            const individualResponses = decodedValue.split("\n");
            const parsedResponses = individualResponses.map(
                response => response.replace(/^data: /, "").trim()
            )
                .filter(response => response !== "" && response !== "[DONE]")
                .map(response => JSON.parse(response));

            for (const response of parsedResponses) {
                const { choices } = response;
                const { delta } = choices[0];
                const { content } = delta;

                if (content) {
                    //resultText.innerText += content;
                    catImage.innerText += content;
                }
            }
        }

    } catch (error) {
        if (signal.aborted) {
            resultText.innerText = "Generation is stopped."
        } else {
            resultText.innerHTML = "Something went wrong while generating.";
            console.log("Error during generatging:", error);
        }
    } finally {
        generateBtn.disabled = false;
        stopBtn.disabled = true;
        controller = null;

    }

};

const stop = () => {
    if (controller) {
        controller.abort();
        controller = null;
    }
};

generateBtn?.addEventListener('click', generate);
generateBtn?.addEventListener('keyup', (e) => {

    if (e.key === "Enter") {
        generate();
    }
});
stopBtn?.addEventListener('click', stop);