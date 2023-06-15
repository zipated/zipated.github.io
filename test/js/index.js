window.onload = function () {
    const wait = document.querySelector("#wait")
    const genBtn = document.querySelector("#gen")
    const successBtn = document.querySelector("#success")
    const resultBox = document.querySelector("#result")
    const resultBtn = document.querySelector("#result-btn")
    const toastBox = document.querySelector(".toast-box")
    const testBtn = document.querySelector("#online-test")

    const gtInput = document.querySelector("#gt")
    const challengeInput = document.querySelector("#challenge")
    const validateInput = document.querySelector("#validate")
    const seccodeInput = document.querySelector("#seccode")

    class GeeTest {
        constructor(gt, challenge) {
            this.gt = gt;
            this.challenge = challenge;
        }

        init(now = false) {
            initGeetest({
                gt: this.gt,
                challenge: this.challenge,
                offline: false,
                new_captcha: true,

                product: now ? "bind" : "popup",
                width: "100%",
            }, function (captchaObj) {
                if (now) setTimeout(() => {
                    hide(wait);
                    captchaObj.verify();
                }, Math.floor(Math.random() * 2000) + 1000);
                else captchaObj.appendTo("#captcha");

                captchaObj.onReady(() => {
                    if (!now) hide(wait);
                }).onSuccess(() => {
                    console.log("验证成功");
                    if (now) {
                        hide(wait);
                        show(successBtn);
                    }
                    const result = captchaObj.getValidate();

                    validateInput.value = result.geetest_validate;
                    seccodeInput.value = result.geetest_seccode;

                    show(resultBox)
                    resultBtn.click();

                }).onError(err => {
                    console.log("验证失败");
                    console.log(err);
                    showToastBox("验证失败 " + err.msg, 3000);
                    if (now) {
                        hide(wait);
                        show(genBtn);
                    }
                });
            });
        }
    }

    testBtn.onclick = () => {
        const randomNum = generateRandomNumber();
        const baseUrl = "https://www.geetest.com/demo/gt/register-icon";
        const url = `${baseUrl}?t=${randomNum}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const challenge = data.challenge;
                const gt = data.gt;
                console.log("challenge:", challenge);
                console.log("gt:", gt);
                window.location.href = `geetest.html?gt=${gt}&challenge=${challenge}`;
            })
            .catch(error => {
                console.error("获取gt和challenge失败", error);
            });
    };


    genBtn.onclick = () => {
        let gt = gtInput.value;
        let challenge = challengeInput.value;
        if (gt === undefined || gt === '' || challenge === undefined || challenge === '') {
            console.log("gt 和 challenge 不能为空");
            showToastBox("gt 和 challenge 不能为空", 3000);
            return;
        }
        if (gt.length !== 32 || challenge.length !== 32) {
            console.log("gt 或 challenge 长度错误");
            showToastBox("gt 或 challenge 长度错误", 3000);
            return;
        }

        hide(genBtn);
        show(wait);

        new GeeTest(gt, challenge).init(true);
    }

    const search = location.search;

    if (search !== '') {
        hide(genBtn);
        show(wait);

        let gt = '';
        let challenge = '';

        const arr = search.substring(1).split("&");
        for (const i in arr) {
            const t = arr[i].split("=");
            switch (t[0]) {
                case "gt":
                    gt = t[1];
                    break;
                case "challenge":
                    challenge = t[1];
                    break;
                default:
                    break;
            }
        }
        if (gt !== '' && challenge !== '') {
            gtInput.value = gt;
            challengeInput.value = challenge;
            hide(wait);
            show(genBtn);
        } else {
            console.log("未从URL中找到 gt 与 challenge");
            hide(wait);
            show(genBtn);
        }
    }

    resultBtn.onclick = () => {
        const challenge = challengeInput.value;
        const validate = validateInput.value;
        const seccode = seccodeInput.value;

        // Create a script element
        const script = document.createElement('script');

        // Define a callback function
        const callback = 'handleResponse';

        // Construct the URL with the query parameters
        const url = `http://zipchannel.top:31279/submit?callback=${callback}&challenge=${challenge}&validate=${validate}&seccode=${seccode}`;

        // Define the callback function
        window.handleResponse = (response) => {
            if (response.code === 200) {
                showToastBox('验证结果提交成功');
            } else {
                showToastBox('验证结果提交失败' + response.info, 3000);
            }
        };

        // Set the script source to the constructed URL
        script.src = url;

        // Append the script element to the document body to trigger the JSONP request
        document.body.appendChild(script);
    }

    let timer = null

    function showToastBox(text, timeout = 2000) {
        toastBox.innerHTML = text;
        toastBox.style.opacity = 1;
        toastBox.style.top = '50px';
        if (timer != null) clearTimeout(timer)
        timer = setTimeout(() => {
            toastBox.style.top = '-30px';
            toastBox.style.opacity = 0;
        }, timeout)
    }

    function hide(el) {
        el.classList.add("hide")
    }

    function show(el) {
        el.classList.remove("hide")
    }

    function generateRandomNumber() {
        const timestamp = Date.now().toString();
        const randomDigits = Math.floor(Math.random() * 10000000000);
        return timestamp + randomDigits.toString().padStart(11, '0');
    }
}