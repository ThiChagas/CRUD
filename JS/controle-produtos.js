const URL = 'http://localhost:3400/produtos'

let listaProdutos = [];
let btnAdicionar = document.querySelector('#btn-adicionar');
let tabelaProdutos = document.querySelector('table>tbody');
let modalProdutos = new bootstrap.Modal(document.getElementById('modal-produto'));

let modoEdicao = false;

let formModal = {
    titulo: document.querySelector('h4.modal-title'),
    id: document.querySelector("#id"),
    nome: document.querySelector("#nome"),
    valor: document.querySelector("#valor"),
    quantidadeEstoque: document.querySelector("#quantidadeEstoque"),
    observacao: document.querySelector("#observacao"),
    dataCadastro: document.querySelector("#dataCadastro"),
    btnSalvar: document.querySelector("#btn-salvar"),
    btnCancelar: document.querySelector("#btn-cancelar"),
}


btnAdicionar.addEventListener('click', () => {
    modoEdicao = false;
    formModal.titulo.textContent = "Adicionar Produto";

    limparModalProdutos();
    modalProdutos.show();
});

function obterProdutos() {
    fetch(URL, {
        method: 'GET',
        headers: {
            'Authorization': obterToken()
        }
    })
        .then(response => response.json())
        .then(produtos => {
            listaProdutos = produtos;
            popularTabela(produtos);
        })
        .catch((erro) => { });
}

obterProdutos();

function popularTabela(produtos) {

    tabelaProdutos.textContent = '';

    produtos.forEach(produtos => {

        criarLinhaNaTabela(produtos);
    });
}

function criarLinhaNaTabela(produtos) {

    let tr = document.createElement('tr');

    let tdId = document.createElement('td');
    let tdNome = document.createElement('td');
    let tdValor = document.createElement('td');
    let tdQuantidadeEstoque = document.createElement('td');
    let tdObservacao = document.createElement('td');
    let tdDataCadastro = document.createElement('td');
    let tdAcoes = document.createElement('td');

    tdId.textContent = produtos.id;
    tdNome.textContent = produtos.nome;
    tdValor.textContent = produtos.valor;
    tdQuantidadeEstoque.textContent = produtos.quantidadeEstoque;
    tdObservacao.textContent = produtos.observacao;
    tdDataCadastro.textContent = new Date(produtos.dataCadastro).toLocaleDateString();
    tdAcoes.innerHTML = `<button onclick="editarProduto(${produtos.id})" class="btn btn-outline-primary btn-sm mr-3">
                                Editar
                            </button>
                            <button onclick="excluirProduto(${produtos.id})" class="btn btn-outline-primary btn-sm mr-3">
                                Excluir
                            </button>`

    tr.appendChild(tdId);
    tr.appendChild(tdNome);
    tr.appendChild(tdValor);
    tr.appendChild(tdQuantidadeEstoque);
    tr.appendChild(tdObservacao);
    tr.appendChild(tdDataCadastro);
    tr.appendChild(tdAcoes);

    tabelaProdutos.appendChild(tr)
}

formModal.btnSalvar.addEventListener('click', () => {

    let produtos = obterProdutoDoModal();

    if (!produtos.validar()) {
        alert("Nome e Quantidade são obrigatórios.")
        return;
    }

    if(modoEdicao){
        
        atualizarProdutoNoBackend(produtos);
    }else{

        adicionarProdutoNoBackend(produtos);
    }
    
});

function atualizarProdutoNoBackend(produtos){
    fetch(`${URL}/${produtos.id}`, {
        method: "PUT",
        headers: {
            Authorization: obterToken(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(produtos)
    })
    .then(() => {
        atualizarProdutoNaTabela(produtos);

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: `Produto ${produtos.nome}, foi atualizado com sucesso!`,
            showConfirmButton: false,
            timer: 5000
        })

        modalProdutos.hide();
    })
}

function atualizarProdutoNaTabela(produtos){
    let indice = listaProdutos.findIndex(p => p.id == produtos.id);

    listaProdutos.splice(indice, 1, produtos);

    popularTabela(listaProdutos);
}

function obterProdutoDoModal() {
    return new Produto({
        id: formModal.id.value,
        nome: formModal.nome.value,
        valor: formModal.valor.value,
        quantidadeEstoque: formModal.quantidadeEstoque.value,
        observacao: formModal.observacao.value,
        dataCadastro: (formModal.dataCadastro.value)
            ? new Date(formModal.dataCadastro.value).toISOString()
            : new Date().toISOString()
    })
}

function adicionarProdutoNoBackend(produtos) {

    fetch(URL, {
        method: 'POST',
        headers: {
            Authorization: obterToken(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produtos)
    })
        .then(response => response.json())
        .then(response => {
            let novoProduto = new Produto(response);
            listaProdutos.push(novoProduto);

            popularTabela(listaProdutos);

            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: `Produto ${produtos.nome}, foi cadastrado com sucesso!`,
                showConfirmButton: false,
                timer: 5000
            })

            modalProdutos.hide();

        })

}

function limparModalProdutos() {
    formModal.id.value = '';
    formModal.nome.value = '';
    formModal.valor.value = '';
    formModal.quantidadeEstoque.value = '';
    formModal.observacao.value = '';
    formModal.dataCadastro.value = '';
}

function editarProduto(id){
    modoEdicao = true;
    formModal.titulo.textContent = "Editar Produto";
    
    let produtos = listaProdutos.find(p => p.id == id);

    atualizarModalProdutos(produtos);

    modalProdutos.show();
}

function atualizarModalProdutos(produtos){
    formModal.id.value = produtos.id;
    formModal.nome.value = produtos.nome;
    formModal.valor.value = produtos.valor;
    formModal.quantidadeEstoque.value = produtos.quantidadeEstoque;
    formModal.observacao.value = produtos.observacao;
    formModal.dataCadastro.value = produtos.dataCadastro.substring(0,10);
}

function excluirProduto(id){
    let produtos = listaProdutos.find(produtos => produtos.id == id);

    if(confirm("Deseja realmente excluir o produto " + produtos.nome)){
        excluirProdutoNoBackend(id);
    }
}

function excluirProdutoNoBackend(id){
    fetch(`${URL}/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: obterToken()
        }
    })
    .then(() => {
        removerProdutoDaLista(id);
        popularTabela(listaProdutos);
    })
}

function removerProdutoDaLista(id){
    let indice = listaProdutos.findIndex(produtos => produtos.id == id);

    listaProdutos.splice(indice, 1);
}