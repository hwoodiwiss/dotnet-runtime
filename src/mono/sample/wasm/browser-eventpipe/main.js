import createDotnetRuntime from "./dotnet.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function doWork(startWork, stopWork, getIterationsDone) {
    const N = parseInt(document.getElementById("inputN").value);


    const workPromise = startWork(N);

    let btn = document.getElementById("startWork");
    btn.disabled = true;
    btn.innerText = "Working";
    document.getElementById("out").innerHTML = '...';

    await delay(5000); // let it run for 5 seconds

    document.getElementById("startWork").innerText = "Stopping";
    document.getElementById("out").innerHTML = '... ...';

    stopWork();

    const ret = await workPromise; // get the answer
    const iterations = getIterationsDone(); // get how many times the loop ran

    btn = document.getElementById("startWork");
    btn.disabled = false;
    btn.innerText = "Start Work";

    document.getElementById("out").innerHTML = `${ret} as computed in ${iterations} iterations`;

    console.debug(`ret: ${ret}`);

    return ret;
}

function getOnClickHandler(startWork, stopWork, getIterationsDone) {
    return async function () {
        await doWork(startWork, stopWork, getIterationsDone);
    }
}

async function main() {
    const { MONO, BINDING, Module } = await createDotnetRuntime(() => {
        return {
            disableDotnet6Compatibility: true,
            configSrc: "./mono-config.json",
        }
    });
    globalThis.__Module = Module;
    globalThis.MONO = MONO;

    const startWork = BINDING.bind_static_method("[Wasm.Browser.EventPipe.Sample] Sample.Test:StartAsyncWork");
    const stopWork = BINDING.bind_static_method("[Wasm.Browser.EventPipe.Sample] Sample.Test:StopWork");
    const getIterationsDone = BINDING.bind_static_method("[Wasm.Browser.EventPipe.Sample] Sample.Test:GetIterationsDone");


    const btn = document.getElementById("startWork");

    btn.style.backgroundColor = "rgb(192,255,192)";
    btn.onclick = getOnClickHandler(startWork, stopWork, getIterationsDone);

}

main();
