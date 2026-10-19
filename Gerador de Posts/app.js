// =========================================================
// REFERÊNCIAS AOS ELEMENTOS DO HTML
// querySelector procura um elemento pelo seletor CSS informado.
// Guardar as referências evita procurar os mesmos elementos várias vezes.
// =========================================================
const form = document.querySelector('#generatorForm');
const topic = document.querySelector('#topic');
const audience = document.querySelector('#audience');
const generateButton = document.querySelector('#generateButton');
const clearButton = document.querySelector('#clearButton');
const copyButton = document.querySelector('#copyButton');
const regenerateButton = document.querySelector('#regenerateButton');
const postCard = document.querySelector('#postCard');
const postText = document.querySelector('#postText');
const placeholder = document.querySelector('#placeholder');
const platformLabel = document.querySelector('#platformLabel');
const postKicker = document.querySelector('#postKicker');
const charCount = document.querySelector('#charCount');
const toast = document.querySelector('#toast');

// Conta qual variação de texto será usada na próxima geração.
let version = 0;
// Guarda o temporizador que fecha a mensagem "Texto copiado".
let toastTimer;

// Retorna o valor marcado em um grupo de opções do formulário.
const selected = name => form.elements[name].value;
// Remove espaços extras do começo, do fim e do meio de um texto.
const clean = value => value.trim().replace(/\s+/g, ' ');

// Frases de abertura organizadas por tom de voz.
// Cada geração escolhe uma frase diferente usando o número da versão.
const hooks = {
  Profissional: [
    'Consistência não é publicar todos os dias. É ser reconhecido toda vez que você publica.',
    'Conteúdo consistente começa com uma decisão simples: clareza antes de volume.',
    'Uma marca forte não precisa falar mais alto. Precisa falar com mais clareza.'
  ],
  Descontraído: [
    'Spoiler: você não precisa virar uma fábrica de posts para ser lembrado.',
    'Vamos combinar? Conteúdo sem personalidade vira só mais um post no feed.',
    'Tem dia em que a ideia vem. Tem dia em que a gente precisa ir buscar — e tudo bem.'
  ],
  Inspirador: [
    'Toda grande presença começa pequena: uma ideia, uma voz e a coragem de publicar.',
    'Sua voz já é o seu melhor diferencial. O próximo passo é deixá-la aparecer.',
    'Você não precisa esperar a ideia perfeita para começar a construir algo memorável.'
  ],
  Direto: [
    'Pare de criar conteúdo só para preencher calendário.',
    'Se o público não reconhece sua voz, o conteúdo não está fazendo o trabalho dele.',
    'Menos posts genéricos. Mais ideias que só poderiam vir de você.'
  ]
};

// Recebe o tema e transforma palavras importantes em até três hashtags.
function hashtagify(text) {
  // Palavras comuns que não funcionam bem como hashtags.
  const stop = new Set(['como','para','pelo','pela','com','sem','uma','umas','uns','dos','das','que','seu','sua','seus','suas','sobre','depois','primeiro','primeira']);
  // Remove acentos, converte para minúsculas e separa o texto em palavras.
  const words = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[a-z0-9]+/g) || [];
  // Filtra, remove palavras repetidas, limita a três e adiciona o símbolo #.
  return [...new Set(words.filter(w => w.length > 4 && !stop.has(w)))].slice(0, 3).map(w => '#' + w[0].toUpperCase() + w.slice(1)).join(' ');
}

// Monta o texto final combinando tema, público, tom e plataforma.
function buildPost(data, pass) {
  // Seleciona o conjunto e a frase de abertura correspondentes ao tom.
  const hookPool = hooks[data.tone];
  const hook = hookPool[pass % hookPool.length];
  // Remove pontuação final do tema para encaixá-lo corretamente nas frases.
  const t = data.topic.replace(/[.!?]+$/, '');
  // Usa hashtags do tema ou um conjunto padrão quando nenhuma for encontrada.
  const tags = hashtagify(data.topic) || '#Conteúdo #Marca #Criatividade';
  // Parágrafos centrais alternativos para as diferentes versões.
  const cores = [
    `Quando o assunto é ${t.toLowerCase()}, muita gente começa procurando a fórmula perfeita.\n\nMas o melhor ponto de partida é outro: entender o que ${data.audience} realmente precisam ouvir — e traduzir isso com a sua perspectiva.`,
    `Na prática, ${t.toLowerCase()} não depende de inspiração infinita.\n\nDepende de uma ideia central, exemplos reais e uma mensagem que faça sentido para ${data.audience}.`,
    `O caminho para ${t.toLowerCase()} fica mais simples quando você troca volume por intenção.\n\nUma mensagem útil, dita do seu jeito, vale mais do que cinco posts que poderiam ter sido escritos por qualquer pessoa.`
  ];
  const core = cores[pass % cores.length];
  // Encerramentos específicos para cada tom de voz.
  const endings = {
    Profissional: 'Comece com o que você já sabe, transforme experiência em ponto de vista e publique com constância.\n\nQual dessas etapas você quer colocar em prática primeiro?',
    Descontraído: 'No fim, a regra é simples: menos pose, mais conversa de verdade.\n\nE você — o que faz um conteúdo parecer autêntico no seu feed?',
    Inspirador: 'A consistência nasce quando a sua mensagem encontra uma forma possível de existir.\n\nSua próxima boa ideia pode começar hoje. O que você quer dizer?',
    Direto: 'Escolha uma ideia. Dê a ela um ponto de vista. Publique.\n\nO que está impedindo você de começar hoje?'
  };

  // O X precisa de uma versão curta, limitada a 280 caracteres.
  if (data.platform === 'X') {
    const xHooks = {
      Profissional: 'Consistência não é postar todo dia. É ser reconhecido toda vez que você posta.',
      Descontraído: 'Você não precisa virar uma fábrica de conteúdo para ser lembrado.',
      Inspirador: 'Sua voz já é seu melhor diferencial. Deixe ela aparecer.',
      Direto: 'Menos conteúdo genérico. Mais ideias que só poderiam vir de você.'
    };
    const post = `${xHooks[data.tone]}\n\nSobre ${t.toLowerCase()}: fale com ${data.audience}, escolha um ponto de vista e corte tudo o que não fortalece a mensagem.\n\nClareza > volume.`;
    // Se ultrapassar 280 caracteres, corta o texto e adiciona reticências.
    return post.length > 280 ? post.slice(0, 276).trimEnd() + '…' : post;
  }

  // O Instagram recebe uma lista visual, chamada para salvar e mais hashtags.
  if (data.platform === 'Instagram') {
    return `${hook}\n\n${core}\n\n3 lembretes para levar com você:\n\n① Fale de um problema por vez.\n② Traga a sua experiência para a conversa.\n③ Termine com um próximo passo claro.\n\n${endings[data.tone]}\n\nSalve para consultar na próxima pauta.\n\n${tags} #CriadoresDeConteúdo`;
  }

  // Quando não é X nem Instagram, retorna o formato padrão do LinkedIn.
  return `${hook}\n\n${core}\n\nTrês movimentos ajudam:\n\n→ escolha uma ideia que você defenderia em uma conversa;\n→ use exemplos que provem o seu ponto;\n→ termine abrindo espaço para a experiência de quem lê.\n\n${endings[data.tone]}\n\n${tags}`;
}

// Lê os valores atuais do formulário e devolve um único objeto organizado.
function currentData() {
  return { topic: clean(topic.value), audience: clean(audience.value), tone: selected('tone'), platform: selected('platform') };
}

// Liga ou desliga o estado visual de carregamento.
function setLoading(isLoading) {
  // A classe loading controla as barras animadas no CSS.
  postCard.classList.toggle('loading', isLoading);
  // Impede novos cliques enquanto o texto está sendo criado.
  generateButton.disabled = isLoading;
  regenerateButton.disabled = isLoading || !postText.textContent;
  copyButton.disabled = isLoading || !postText.textContent;
  generateButton.querySelector('span').textContent = isLoading ? 'Criando sua versão…' : 'Gerar meu post';
  generateButton.querySelector('svg').classList.toggle('spin', isLoading);
}

// Função principal chamada quando o usuário pede um novo post.
async function generate(data = currentData()) {
  // Interrompe a geração e mostra os avisos nativos se faltarem dados.
  if (!data.topic || !data.audience) {
    form.reportValidity();
    return null;
  }
  // Mostra o estado de carregamento.
  setLoading(true);
  // Aguarda 850 ms para simular o tempo de uma geração por API.
  await new Promise(resolve => setTimeout(resolve, 850));
  // Cria o texto e aumenta a versão para variar a próxima resposta.
  const result = buildPost(data, version++);
  // Atualiza o conteúdo e os rótulos visíveis no painel direito.
  postText.textContent = result;
  postText.hidden = false;
  placeholder.hidden = true;
  platformLabel.textContent = data.platform;
  postKicker.textContent = `Versão para ${data.platform}`;
  charCount.textContent = `${result.length} caracteres`;
  setLoading(false);
  return result;
}

// Impede o recarregamento padrão do formulário e inicia a geração.
form.addEventListener('submit', event => { event.preventDefault(); generate(); });
// O botão de nova versão chama a mesma geração com o contador atualizado.
regenerateButton.addEventListener('click', () => generate());
// Atualiza imediatamente o nome da plataforma no cabeçalho do resultado.
document.querySelectorAll('input[name="platform"]').forEach(input => input.addEventListener('change', () => { platformLabel.textContent = input.value; }));

// Copia o post e mostra uma confirmação temporária na tela.
copyButton.addEventListener('click', async () => {
  // Usa a API moderna de clipboard; o catch mantém compatibilidade com navegadores antigos.
  try { await navigator.clipboard.writeText(postText.textContent); }
  catch { const range = document.createRange(); range.selectNode(postText); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); document.execCommand('copy'); selection.removeAllRanges(); }
  copyButton.querySelector('span').textContent = 'Copiado!';
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.classList.remove('show'); copyButton.querySelector('span').textContent = 'Copiar texto'; }, 1800);
});

// Limpa o formulário e devolve a interface ao estado inicial.
clearButton.addEventListener('click', () => {
  topic.value = '';
  audience.value = '';
  form.elements.platform.value = 'LinkedIn';
  form.elements.tone.value = 'Profissional';
  postText.textContent = '';
  postText.hidden = true;
  placeholder.hidden = false;
  platformLabel.textContent = 'LinkedIn';
  postKicker.textContent = 'Rascunho inteligente';
  charCount.textContent = '0 caracteres';
  copyButton.disabled = true;
  regenerateButton.disabled = true;
  version = 0;
  topic.focus();
});

// Registra uma ferramenta WebMCP quando o navegador oferece esse recurso.
// Assim, um agente compatível também pode preencher o formulário e gerar o post.
function registerWebMCP() {
  const context = document.modelContext;
  // Encerra silenciosamente em navegadores sem suporte a WebMCP.
  if (!context?.registerTool) return;
  // Define quais dados a ferramenta aceita e quais valores são permitidos.
  const schema = {
    type: 'object',
    properties: {
      topic: { type: 'string', minLength: 3, maxLength: 500 },
      audience: { type: 'string', minLength: 2, maxLength: 160 },
      tone: { type: 'string', enum: ['Profissional', 'Descontraído', 'Inspirador', 'Direto'] },
      platform: { type: 'string', enum: ['LinkedIn', 'Instagram', 'X'] }
    },
    required: ['topic', 'audience', 'tone', 'platform'],
    additionalProperties: false
  };
  // Valida os dados recebidos antes de alterar a interface.
  const validate = input => {
    if (!input || typeof input !== 'object' || !schema.required.every(key => typeof input[key] === 'string')) throw new Error('Informe tema, público, tom e plataforma.');
    if (!schema.properties.tone.enum.includes(input.tone) || !schema.properties.platform.enum.includes(input.platform)) throw new Error('Tom ou plataforma inválidos.');
    if (clean(input.topic).length < 3 || clean(input.audience).length < 2) throw new Error('Tema ou público muito curtos.');
    return { topic: clean(input.topic), audience: clean(input.audience), tone: input.tone, platform: input.platform };
  };
  try {
    // Publica a ferramenta generate_social_post no contexto da página.
    void Promise.resolve(context.registerTool({
      name: 'generate_social_post',
      title: 'Gerar post social',
      description: 'Cria um post e atualiza o rascunho visível usando tema, público, tom e plataforma.',
      inputSchema: schema,
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        // Valida, preenche os mesmos campos visíveis e usa a função principal.
        const data = validate(input);
        topic.value = data.topic; audience.value = data.audience; form.elements.tone.value = data.tone; form.elements.platform.value = data.platform;
        const text = await generate(data);
        return { platform: data.platform, characters: text.length, text };
      }
    })).catch(() => {});
  } catch {}
}
// Executa o registro assim que o arquivo JavaScript termina de carregar.
registerWebMCP();
