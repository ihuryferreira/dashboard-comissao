// Capturar elementos
const form = document.querySelector(".forms");
const tabelaBody = document.getElementById("tabela-body");
const ctx = document.getElementById("graficoVendas").getContext("2d");

const TAXA_COMISSAO = 0.065; // 6.5% de comissão
let totalComissao = 0;
let dadosVendas = JSON.parse(localStorage.getItem("dadosVendas")) || [];
let nomesVendedores = JSON.parse(localStorage.getItem("nomesVendedores")) || [];
let datasVendas = JSON.parse(localStorage.getItem("datasVendas")) || [];
let horariosVendas = JSON.parse(localStorage.getItem("horariosVendas")) || [];
let totalComissaoVendas =
  JSON.parse(localStorage.getItem("totalComissaoVendas")) || [];
if (totalComissaoVendas.length === 0) {
  totalComissaoVendas = new Array(nomesVendedores.length).fill(0);
}

// Criar gráfico inicialmente
const graficoVendas = new Chart(ctx, {
  type: "bar",
  data: {
    labels: nomesVendedores,
    datasets: [
      {
        label: "Vendas por Vendedor",
        data: dadosVendas,
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 205, 86, 0.2)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 205, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

// Função para atualizar o gráfico e salvar no LocalStorage
function atualizarGrafico() {
  graficoVendas.data.labels = nomesVendedores;
  graficoVendas.data.datasets[0].data = dadosVendas;
  graficoVendas.update();
  salvarDadosLocalmente();
}

// Função para salvar os dados localmente
function salvarDadosLocalmente() {
  localStorage.setItem("nomesVendedores", JSON.stringify(nomesVendedores));
  localStorage.setItem("dadosVendas", JSON.stringify(dadosVendas));
  localStorage.setItem("datasVendas", JSON.stringify(datasVendas));
  localStorage.setItem("horariosVendas", JSON.stringify(horariosVendas));
  localStorage.setItem(
    "totalComissaoVendas",
    JSON.stringify(totalComissaoVendas)
  ); // Salvar comissões
}

// Evento de submissão do formulário
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nomeVendedor = document.getElementById("vendedor").value.trim();
  const valorVendaInput = document.getElementById("servico").value.trim();
  const valorVenda = parseFloat(valorVendaInput);

  if (!nomeVendedor || isNaN(valorVenda) || valorVenda <= 0) {
    alert("Por favor, insira um nome válido e um valor positivo.");
    return;
  }

  const comissao = valorVenda * TAXA_COMISSAO;
  totalComissao += comissao;

  const dataVenda = new Date().toLocaleDateString("pt-BR");
  const horarioVenda = new Date().toLocaleTimeString("pt-BR");

  // Criar nova linha na tabela
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${nomeVendedor}</td>
    <td>R$ ${valorVenda.toFixed(2)}</td>
    <td>R$ ${comissao.toFixed(2)}</td>
    <td>R$ ${totalComissao.toFixed(2)}</td>
    <td>${dataVenda}</td>
    <td>${horarioVenda}</td>
    <td><button onclick="removerLinha(this, '${nomeVendedor}', ${valorVenda})">🗑 Excluir</button></td>
  `;

  tabelaBody.appendChild(tr);

  // Adicionar dados ao gráfico e armazenar data/hora
  const index = nomesVendedores.indexOf(nomeVendedor);
  if (index !== -1) {
    dadosVendas[index] += valorVenda;
    totalComissaoVendas[index] += comissao; // Somar comissão existente
  } else {
    nomesVendedores.push(nomeVendedor);
    dadosVendas.push(valorVenda);
    totalComissaoVendas.push(comissao); // Adicionar nova comissão corretamente
    datasVendas.push(dataVenda);
    horariosVendas.push(horarioVenda);
  }

  atualizarGrafico();
  salvarDadosLocalmente();
  form.reset();
});

// Função para carregar os dados ao iniciar a página
// Função para carregar os dados ao iniciar a página
function carregarDadosLocalmente() {
  const dadosVendedoresSalvos = localStorage.getItem("nomesVendedores");
  const vendasSalvas = localStorage.getItem("dadosVendas");
  const datasSalvas = localStorage.getItem("datasVendas");
  const horariosSalvos = localStorage.getItem("horariosVendas");

  if (dadosVendedoresSalvos && vendasSalvas && datasSalvas && horariosSalvos) {
    nomesVendedores = JSON.parse(dadosVendedoresSalvos) || [];
    dadosVendas = JSON.parse(vendasSalvas) || [];
    datasVendas = JSON.parse(datasSalvas) || [];
    horariosVendas = JSON.parse(horariosSalvos) || [];

    // **Filtrar possíveis valores inválidos**
    nomesVendedores = nomesVendedores.filter(
      (nome, index) => nome && dadosVendas[index] > 0
    );
    dadosVendas = dadosVendas.filter((valor) => valor > 0);
    datasVendas = datasVendas.filter((data) => data);
    horariosVendas = horariosVendas.filter((horario) => horario);

    atualizarTabela();
    atualizarGrafico();
  }
}

// Função para remover linha da tabela e atualizar gráfico
function removerLinha(botao, nomeVendedor, valorVenda) {
  const index = nomesVendedores.indexOf(nomeVendedor);

  if (index !== -1) {
    nomesVendedores.splice(index, 1);
    dadosVendas.splice(index, 1);
    datasVendas.splice(index, 1);
    horariosVendas.splice(index, 1);

    salvarDadosLocalmente();
    atualizarGrafico();
    atualizarTabela();
  }

  botao.parentElement.parentElement.remove();
}

// **Garante que a função está global**
window.removerLinha = removerLinha;

// Função para atualizar tabela ao carregar dados do LocalStorage
function atualizarTabela() {
  tabelaBody.innerHTML = "";

  nomesVendedores.forEach((nome, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nome}</td>
      <td>R$ ${dadosVendas[index].toFixed(2)}</td>
      <td>R$ ${(dadosVendas[index] * TAXA_COMISSAO).toFixed(2)}</td>
      <td>R$ ${(totalComissaoVendas[index] || 0).toFixed(2)}</td> <td>${
      datasVendas[index]
    }</td>
      <td>${horariosVendas[index]}</td>
      <td><button onclick="removerLinha(this, '${nome}', ${
      dadosVendas[index]
    })">🗑 Excluir</button></td>
    `;
    tabelaBody.appendChild(tr);
  });
}

// Carregar os dados ao iniciar a página
carregarDadosLocalmente();
