function salvarToken(token){
    localStorage.setItem('token', token)
}

function obterToken(token){
    return localStorage.getItem("token");
}

function salvarUsuario(usuario){
    return localStorage.setItem('usuario', JSON.stringify(usuario));
}

function obterUsuario(usuario){
    let usuarioStorage = localStorage.getItem("usuario");
    return JSON.parse(usuarioStorage);
}

function sairDoSistema(){
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.open('login.html', '_self');
}