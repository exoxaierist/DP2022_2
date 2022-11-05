let overlay;
document.onreadystatechange = ()=>CheckLoad();

function CheckLoad(){
    if (document.readyState === 'ready' || document.readyState ==='complete') {
        overlay = document.querySelector('#loadingOverlay');
        OnLoad();
    }
}

function OnLoad(){
    setTimeout(() => {
        overlay.style.opacity="0%";
        overlay.style.pointerEvents="none";
    }, 5500);
}