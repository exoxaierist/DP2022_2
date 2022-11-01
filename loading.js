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
        overlay.style.display = 'none';
    }, 1000);
}