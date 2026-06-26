import { BookPage, CatalogCard } from "./types";

// Official Brazilian Cataloging-in-Publication Block (Ficha Catalográfica) definitions
export const catalogCardData: CatalogCard = {
  author: "Anderson Silva",
  title: "Toinho, o Amigo Leal e a Sabedoria de Val",
  subtitle: "O Conhecimento é a Maior Aventura",
  place: "Belo Horizonte, MG",
  year: "2026",
  pagesCount: 19,
  isbn: "978-65-89012-34-5",
  cdd: "028.5", // Literatura infantojuvenil brasileira
  cdu: "821.134.3(81)-93",
  keywords: [
    "1. Literatura infantil brasileira.",
    "2. Valores e virtudes morais.",
    "3. Educação e aprendizado.",
    "4. Amizade e persistência."
  ],
  cataloguerCode: "CRB-6/10245"
};

export const bookPages: BookPage[] = [
  {
    id: 1,
    chapter: "Capa",
    title: "Toinho, o Amigo Leal e a Sabedoria de Val",
    subtitle: "O Conhecimento é a Maior Aventura",
    paragraphs: [
      "Uma jornada encantadora sobre o poder da educação, lealdade, flexibilidade e a busca pela verdadeira riqueza no mundo.",
      "Autor: Anderson Silva"
    ],
    image: "/images/ebook_cover_1782165032251.jpg",
    imageAlt: "Toinho e Val caminhando hand-in-hand pelo bosque mágico em direção ao castelo do saber",
    audio: "/audio/pagina1.mp3",
    type: "cover"
  },
  {
    id: 2,
    chapter: "Informações Legais",
    title: "Propriedade Intelectual & Contra Cópia",
    subtitle: "Código de Registro e Proteção ao Autor",
    paragraphs: [
      "Data de Criação: 15 de Dezembro de 2025",
      "© 2026 Anderson Silva - Todos os direitos reservados para a presente edição.",
      "CÓDIGO DE CONTROLE CONTRA CÓPIA: REG-BR-2026-TF82-VIP",
      "É estritamente proibida a cópia, pirataria, distribuição, modificação ou comercialização não autorizada deste e-book, no todo ou em parte, por qualquer meio físico ou digital. As infrações estão sujeitas às sanções civis e criminais em conformidade com as leis do Brasil, incluindo a Lei Federal de Direitos Autorais nº 9.610, de 19 de fevereiro de 1998, e o Artigo 184 do Código Penal Brasileiro.",
      "Este material faz parte de um projeto educativo nacional que visa guiar crianças e educadores no caminho dos valores humanos fundamentais."
    ],
    audio: "/audio/pagina2.mp3",
    type: "copyright"
  },
  {
    id: 3,
    chapter: "Abertura",
    title: "Dedicatória & Prefácio",
    subtitle: "Para os Pequenos Exploradores do Amanhã",
    paragraphs: [
      "Dedico esta obra a todas as crianças brasileiras que, em cada manhã, vencem a preguiça e calçam seus sapatos para caminhos de aprendizado. Vocês são o futuro brilhante de nossa nação.",
      "Dedico também aos pais, professores e educadores, que com paciência de artesão moldam as mentes de nossos pequenos, acendendo faróis que nunca mais se apagarão na escuridão.",
      "Que as aventuras de Toinho e Val entrem em seus lares não apenas como passatempo, mas como sementes de virtudes que florescerão em caráter, resiliência e sabedoria pura."
    ],
    quote: "Educar a mente sem educar o coração não é educação de forma alguma.",
    quoteAuthor: "Aristóteles",
    audio: "/audio/pagina3.mp3",
    type: "dedication"
  },
  {
    id: 4,
    chapter: "Nota aos Educadores",
    title: "Uma Jornada de Descobertas",
    subtitle: "Nota para Pais e Educadores",
    paragraphs: [
      "Este livro foi criado com o coração na mão, pensando nas crianças que, assim como Toinho, às vezes preferem o conforto aconchegante da cama à aventura ativa do aprendizado escolar. As histórias aqui contadas têm o poder de transformar a rotina de ir à escola de uma obrigação cansativa em uma jornada de descobertas mágicas e empolgantes.",
      "Através da amizade leal e sincera entre Toinho e Val, mostramos que a curiosidade genuína e a dedicação diária aos estudos são os verdadeiros superpoderes que todos nós podemos carregar no peito.",
      "Estimule a leitura conjunta antes de dormir ou na sala de aula. Use os ensinamentos práticos de cada capítulo para conversas produtivas do dia a dia, transformando a clássica 'preguiça matinal' em uma motivação autêntica e cheia de propósito.",
      "Cada capítulo abordará lições cruciais e pedagógicas sobre lealdade, flexibilidade mental, persistência e o poder transformador do conhecimento prático. Boa leitura!"
    ],
    image: "/images/cozy_library_1782165046463.jpg",
    imageAlt: "Crianças sentadas em um tapete macio lendo livros antigos em uma biblioteca mágica e ensolarada",
    audio: "/audio/pagina4.mp3",
    type: "preface"
  },
  {
    id: 5,
    chapter: "Capítulo 1",
    title: "O Povoado das Sete Colinas",
    subtitle: "Onde Nossos Amigos Se Encontram",
    paragraphs: [
      "Era uma vez, no topo de um vale cercado por montanhas verdejantes cobertas por uma névoa suave, um pequeno e charmoso lugarejo chamado Povoado das Sete Colinas. As casas de paredes brancas e telhados de barro pareciam brotar da própria terra, e um rio cristalino serpenteava alegremente por ali.",
      "Nesse povoado vivia Toinho, um menino alegre, de bochechas coradas e cabelos castanhos sempre bagunçados pelo vento das brincadeiras. Toinho tinha uma energia contagiante para subir em árvores e correr atrás de borboletas, mas, quando o assunto era acordar cedo ou sentar para ler, ele logo dava um bocejo demorado, inventando mil desculpas.",
      "Por outro lado, morava na colina vizinha a pequena Val, uma menina de tranças longas e negras, olhos atentos à cor do mel e um sorriso constante. Val carregava sempre um livro debaixo do braço como se fosse um escudo protetor contra o tédio. Para ela, cada página era um portal para uma aventura sem sair do lugar.",
      "Apesar das diferenças, os dois eram melhores amigos. Toinho ensinava Val a pescar e a equilibrar-se nos troncos de madeira, enquanto Val contava a Toinho as incríveis lendas escritas que descobria. Mas Toinho ainda não compreendia por que ela se esforçava tanto para ir à escola todos os dias."
    ],
    image: "/images/village_seven_hills_1782477395367.jpg",
    imageAlt: "O charmoso Povoado das Sete Colinas cercado por montanhas verdejantes cobertas por névoa suave",
    audio: "/audio/pagina5.mp3",
    type: "content"
  },
  {
    id: 6,
    chapter: "Capítulo 2 - Parte I",
    title: "A Lição da Árvore e o Vento",
    subtitle: "O Carvalho Rígido",
    paragraphs: [
      "Certa tarde, enquanto caminhavam pela imensa floresta do Vale, Toinho e Val foram surpreendidos por um forte vendaval que anunciava uma grande tempestade de outono. As nuvens tornaram-se cinzentas e o vento uivava furioso entre as copas das árvores.",
      "Eles correram para se abrigar sob a copa de um bosque, de onde puderam observar a majestade de um gigantesco Carvalho. Era a árvore mais alta e grossa do vale, orgulhoso de suas raízes centenárias e seu tronco largo e aparentemente inquebrável. O carvalho parecia zombar de todas as tempestades.",
      "No entanto, conforme a tormenta aumentava de intensidade, as rajadas de vento batiam com força em seus galhos pesados. O imponente carvalho manteve-se rígido, recusando-se a ceder um centímetro sequer diante do vento da tempestade.",
      "Subitamente, um som estalado e ensurdecedor ecoou pela floresta. Incapaz de adaptar-se e suportar tamanha pressão sem se mexer, o orgulhoso carvalho rachou ao meio, ruindo pesadamente sobre o chão molhado. Sua imensa força rígida havia se transformado em sua maior fraqueza."
    ],
    image: "/images/oak_and_bamboo_1782165061029.jpg",
    imageAlt: "O orgulhoso e largo carvalho quebrado ao meio pela força do vento na tempestade da floresta",
    audio: "/audio/pagina6.mp3",
    type: "content"
  },
  {
    id: 7,
    chapter: "Capítulo 2 - Parte II",
    title: "A Lição da Árvore e o Vento",
    subtitle: "O Bambu Flexível",
    paragraphs: [
      "Bem ao lado da enorme clareira onde jazia o carvalho caído, Toinho e Val avistaram uma pequena cana-de-bambu, tão fina, humilde e delicada que parecia que seria arrancada no primeiro sopro do vendaval.",
      "Todavia, quando as fortes rajadas de vento voltaram a soprar com força extrema, o pequeno bambu tomou uma atitude completamente diferente. Com extrema humildade e sabedoria, ele apenas se curvou lindamente, deixando que o vento poderoso passasse livremente pelas suas folhas sem encontrar resistência.",
      "O bambu dobrou-se quase até tocar o solo molhado, balançando de um lado para o outro de forma calma, sem qualquer rigidez ou orgulho. Assim que a tempestade passou e as nuvens se abriram, ele ergueu-se devagar, inteiramente intacto, verde brilhante e firme em sua posição original.",
      "Toinho, boquiaberto, olhou para o tronco partido do carvalho e depois para a delicada haste do bambu sobrevivente. Naquele dia, ele aprendeu um dos maiores ensinamentos de sua juventude."
    ],
    quote: "Não seja uma pedra, que resiste e quebra. Seja o bambu, que se curva e perdura.",
    quoteAuthor: "A Sabedoria do Pai",
    highlights: ["A Grande Lição: Ser leal aos seus valiosos valores não significa ser rígido em suas ações cotidianas. Você pode adaptar-se aos ventos das circunstâncias sem perder sua essência de vista, como o sábio bambu na tempestade."],
    imageContextual: "/images/oak_and_bamboo_1782165061029.jpg",
    imageContextualAlt: "O bambu flexível curvando-se com humildade sob a força do vento",
    audio: "/audio/pagina7.mp3",
    type: "content"
  },
  {
    id: 8,
    chapter: "Capítulo 3 - Parte I",
    title: "O Tesouro Perdido do Poço",
    subtitle: "Boatos Sobre Riquezas Escondidas",
    paragraphs: [
      "Na parte mais antiga do Povoado das Sete Colinas, existiam histórias misteriosas que passavam de geração em geração. Dizia-se que um antiquíssimo poço de pedras, localizado em um jardim secreto cercado por trepadeiras selvagens, escondia em seu fundo uma riqueza sem igual.",
      "Atraídos pela ganância, muitos homens e jovens aventureiros de outras terras já haviam escavado o chão ao redor do poço, quebrando rochas e revirando a terra úmida em busca de baús escondidos repletos de moedas de ouro reluzentes, safiras ou joias preciosas perdidas.",
      "No entanto, por mais que cavassem, ninguém jamais encontrou um único anel ou metal precioso. Frustrados, muitos consideravam a lenda do poço apenas uma mentira de pastores antigos.",
      "Toinho, fascinado por essas lendas de piratas e riquezas, perguntou para sua mãe se ela sabia qual era o verdadeiro segredo que existia por trás daquele misterério secular do poço antigo."
    ],
    image: "/images/magical_well_1782165075523.jpg",
    imageAlt: "O poço antigo cercado por trepadeiras selvagens no jardim secreto do vale",
    audio: "/audio/pagina8.mp3",
    type: "content"
  },
  {
    id: 9,
    chapter: "Capítulo 3 - Parte II",
    title: "O Tesouro Perdido do Poço",
    subtitle: "A Verdadeira Riqueza Diária",
    paragraphs: [
      "A sábia mãe de Toinho, sorrindo docemente, lavou suas mãos na bacia e levou o menino até a borda do poço. Ela retirou um balde cheio até a borda de uma água cristalina, fresca e pura. Ofereceu-lhe um gole refrescante.",
      "Ela explicou que o verdadeiro tesouro, o segredo do poço que alimentava e sustentava toda a vida da vila, estava exatamente naquela água pura que nunca secava, mesmo no verão mais implacável. Sem ela, nenhuma horta cresceria, as crianças passariam sede e a vila inteira desapareceria sob o sol.",
      "Muitas pessoas passam a vida inteira procurando por riquezas grandiosas, caras e raras, mas ignoram completamente os presentes mais simples, fundamentais e essenciais da existência: a saúde robusta que nos permite caminhar, o sol que nasce todas as manhãs iluminando a Terra, e o amor sincero daqueles que estão ao nosso lado.",
      "Toinho percebeu então que a verdadeira fortuna não brilha como o ouro, mas flui de forma discreta, curando e nutrindo."
    ],
    image: "/images/magical_well_1782165075523.jpg",
    imageAlt: "Mãe carinhosa oferecendo água fresca do poço antigo de pedras ao seu filho pequeno em um belo jardim",
    imageContextual: "/images/magical_well_1782165075523.jpg",
    imageContextualAlt: "A pureza e frescor da água do poço antigo de pedras",
    highlights: [
      "Água Pura: O essencial absoluto para a vida, disponível gratuitamente todos os dias.",
      "Sol Nascente: A luz divina que nasce e afasta o frio da noite a cada novo amanhecer.",
      "Amor Verdadeiro: O carinho sagrado e o companheirismo das pessoas de bem ao nosso redor."
    ],
    audio: "/audio/pagina9.mp3",
    type: "content"
  },
  {
    id: 10,
    chapter: "Capítulo 4 - Parte I",
    title: "Os Livros Mágicos de Val",
    subtitle: "Um Farol na Beira da Estrada",
    paragraphs: [
      "Em um belo e ensolarado dia, Toinho estava sentado à beira da longa estrada de terra do povoado, desenhando formas na areia com um pedaço de galho seco, sentindo-se um tanto entediado e sem rumo.",
      "De longe, ele viu surgir a figura alegre de Val. Ela caminhava ritmada, voltando da distante Casa dos Contos (que era como as crianças chamavam com carinho a biblioteca pública da cidade grande). Val trazia nos braços um livro de capa dura ornamentada, com relevos dourados.",
      "Ela sorria contente, com os olhos brilhando enquanto lia de forma concentrada enquanto andava. Toinho a chamou e desabafou sobre a dificuldade que sentia em ir para a escola, dizendo que preferia mil vezes ficar brincando livre no campo.",
      "Val sentou-se ao lado dele. Com muita paciência e criatividade de amiga, resolveu lhe contar uma bela fábula visual que lera naquele mesmo dia, usando a seguinte metáfora."
    ],
    image: "/images/glowing_lighthouse_book_1782477420970.jpg",
    imageAlt: "Val lendo seu livro de capa dura ornamentada e reluzente",
    audio: "/audio/pagina10.mp3",
    type: "content"
  },
  {
    id: 11,
    chapter: "Capítulo 4 - Parte II",
    title: "Os Livros Mágicos de Val",
    subtitle: "O Farol da Sabedoria Humana",
    paragraphs: [
      "Val desenhou no chão um mar tempestuoso com um navio perdido. 'Imagine', disse ela com voz misteriosa, 'que a vida é como um oceano desconhecido e o conhecimento é o farol que fica no alto de uma montanha rochosa.'",
      "Para acender esse grandioso farol e mantê-lo brilhando intensamente, o homem responsible precisa ter estudado muito, conhecendo os ventos, as engrenagens e as correntes. Se o guardião do farol se entregar à preguiça, a chama se apagará e os navios se chocarão contra os recifes na escuridão.",
      "Ir à escola e estudar com dedicação é exatamente como acender o seu próprio farol interno. Se você escolhe não ir e não exercita sua inteligência, sua mente permanece na escuridão, e você corre o grande risco de perder-se no mar das escolhas futures da vida.",
      "A preguiça, Toinho, é como um vento forte e frio que tenta apagar sua luz a todo momento. Não deixe que o farol dos seus mais belos sonhos se apague por simples falta de estudo!"
    ],
    highlights: [
      "O Farol da Sabedoria: O estudo desenvolve o rumo certo para nossas vidas.",
      "Acenda sua Própria Luz: Estudar nos ensina a decidir nosso próprio destino com responsabilidade.",
      "Vença o Vento: Cada livro aberto é uma noite a menos de escuridão em nossa mente."
    ],
    imageContextual: "/images/glowing_lighthouse_book_1782477420970.jpg",
    imageContextualAlt: "O farol de stardust no alto da montanha guiando navios perdidos",
    audio: "/audio/pagina11.mp3",
    type: "content"
  },
  {
    id: 12,
    chapter: "Capítulo 5 - Parte I",
    title: "A Lição do Passarinho Atrasado",
    subtitle: "O Despertar Preguiçoso",
    paragraphs: [
      "Nas semanas seguintes, chegou o inverno, e o frio cortante tornava muito difícil a tarefa de sair do quentinho das cobertas ao amanhecer para caminhar até as salas de aula da escola do vilarejo.",
      "Toinho, encolhido sob seus cobertores grossos de lã, suspirava. Decidiu que não iria à aula, alegando que uns minutos a mais de sono de manhã não fariam qualquer diferença em sua vida.",
      "Val, sabendo do atraso do amigo, passou em sua janela e, percebendo que ele ainda não estava pronto, sentou-se na borda da cama e contou a história do Passarinho Sonolento.",
      "Esse passarinho vivia em uma floresta distante e odiava acordar com os primeiros raios de sol. Sempre dizia que a pressa era inimiga da perfeição e que dormir até mais tarde era seu privilégio natural."
    ],
    image: "/images/sleepy_bird_1782477406615.jpg",
    imageAlt: "O inverno frio no vilarejo e a tentação de ficar na cama quentinha",
    audio: "/audio/pagina12.mp3",
    type: "content"
  },
  {
    id: 13,
    chapter: "Capítulo 5 - Parte II",
    title: "A Lição do Passarinho Atrasado",
    subtitle: "As Frutas Secas do Atraso",
    paragraphs: [
      "Certo dia, a grande revoada de pássaros marcou o voo anual para o Vale das Frutas Doces. O Passarinho Sonolento, adormecido além da conta, perdeu a partida coletiva de madrugada.",
      "Quando finalmente acordou à tarde e voou sozinho, as frutas mais maduras, suculentas e macias já haviam sido inteiramente consumidas por todos os pássaros pontuais que chegaram no horário correto. Só lhe restaram as frutas secas, azedas e duras, além de ter demorado dias para encontrar um lar seguro.",
      "O aprendizado e as grandes oportunidades são exatamente como as saborosas frutas maduras. Elas só estão disponíveis para quem chega na hora combinada e demonstra compromisso diário.",
      "Ouvindo aquilo de sua amiga, Toinho pulou da cama na mesma hora! Ele percebeu que a rotina produtiva e a pontualidade na escola não eram formas de punição, mas as verdadeiras chaves para aproveitar as melhores oportunidades de crescimento pessoal."
    ],
    steps: [
      { number: "1", title: "Acordar Muito Tarde", desc: "O passarinho prefere o conforto temporário do sono matinal diário." },
      { number: "2", title: "Perder a Revoada", desc: "A coletividade avança em sincronia e o passarinho preguiçoso fica para trás." },
      { number: "3", title: "Frutas Secas", desc: "As melhores oportunidades se esgotam, restando as piores opções do mercado." },
      { number: "4", title: "Dificuldades", desc: "O caminho do crescimento pessoal torna-se árduo e solitário." }
    ],
    imageContextual: "/images/sleepy_bird_1782477406615.jpg",
    imageContextualAlt: "O passarinho sonolento comendo as frutas secas do atraso",
    audio: "/audio/pagina13.mp3",
    type: "content"
  },
  {
    id: 14,
    chapter: "Capítulo 6 - Parte I",
    title: "O Mapa dos Tesouros Escondidos",
    subtitle: "Desvendando Simbologias Complexas",
    paragraphs: [
      "Apesar de estar acordando no horário e participando ativamente, Toinho começou a achar as lições de alfabetização e escrita complexas demais. Ele se queixava de que decorar letras e fonemas parecia uma tarefa sem sentido.",
      "'Por que preciso conectar essas pequenas formas rabiscadas no papel, Val? Isso não faz sentido nenhum para um garoto do campo', reclamava ele, jogando seu lápis sobre a carteira escolar.",
      "Val olhou para o lápis de grafite e depois para o caderno de Toinho. Then pegou uma folha envelhecida de papel e desenhou de próprio punho um maravilhoso mapa geográfico de tesouro, cheio de símbolos misteriosos, montanhas e lagos.",
      "Ela explicou que, sem decifrar os segredos escritos do papel, Toinho nunca conseguiria desvendar o caminho correto de nenhum mapa, ficando irremediavelmente perdido diante dos mistérios do vasto mundo."
    ],
    image: "/images/glowing_treasure_map_1782477432178.jpg",
    imageAlt: "O maravilhoso mapa do tesouro desenhado por Val",
    audio: "/audio/pagina14.mp3",
    type: "content"
  },
  {
    id: 15,
    chapter: "Capítulo 6 - Parte II",
    title: "O Mapa dos Tesouros Escondidos",
    subtitle: "Escrevendo a Própria História",
    paragraphs: [
      "Val detalhou quatro motivos cruciais pelos quais saber ler e escrever era fundamental para todo grande explorador da vida:",
      "A leitura e a escrita são, de fato, o mapa e a bússola que carregamos na mochila da mente de forma permanente. Se você não os possui desenvolvidos, pode até ser fisicamente muito forte, mas caminhará eternamente perdido e dependente de outros pela floresta da vida civil, sem governar os seus passos.",
      "Toinho tocou nos traços do mapa de papel de Val e, pela primeira vez, compreendeu o profundo valor de cada linha e de cada palavra escrita em seu caderno do colégio. Ele dedicou-se com afinco a partir daquela maravilhosa conversa."
    ],
    steps: [
      { number: "01", title: "Ler o Mapa do Destino", desc: "Para descobrir os antigos segredos e ciências do mundo, você precisa saber decifrar livros." },
      { number: "02", title: "Explorar Mundos Novos", desc: "Grandes líderes precisaram de instruções geográficas escritas de outros navegadores para alcançar portos seguros." },
      { number: "03", title: "Decifrar Códigos Sociais", desc: "O conhecimento das leis e das técnicas protege as vilas de abusos. A caneta sempre foi mais poderosa do que a espada armada." },
      { number: "04", title: "Escrever a Própria Lenda", desc: "Se você mesmo não souber escrever com maestria, nunca poderá contar sua real história ao mundo com suas próprias palavras." }
    ],
    imageContextual: "/images/glowing_treasure_map_1782477432178.jpg",
    imageContextualAlt: "O mapa envelhecido mostrando as direções cruciais e símbolos do destino",
    audio: "/audio/pagina15.mp3",
    type: "content"
  },
  {
    id: 16,
    chapter: "Capítulo 7 - Parte I",
    title: "O Legado de Val e Toinho",
    subtitle: "Toinho, o Comerciante Leal",
    paragraphs: [
      "Muitos anos se passaram alegremente pelas montanhas do vale. As crianças de bochechas coradas cresceram e tornaram-se adultos sábios, trabalhadores e engajados no bem de todos.",
      "Toinho, graças ao apoio constante e à preciosa motivação de sua melhor amiga Val, persistiu na escola e concluiu todos os seus estudos com grande honra. Ele tornou-se um próspero, conhecido e querido comerciante local no Povoado das Sete Colinas.",
      "Ele utilizava as complexas fórmulas matemáticas aplicadas de forma prática e leal para realizar negociações altamente justas com todas as famílias da região, sem nunca enganar ninguém nos pesos ou nas contas.",
      "A lealdade de Toinho para com os seus clientes e amigos transformou sua mercearia no maior e mais respeitado centro de comércio de todo o vale, gerando prosperidade compartilhada por todos."
    ],
    highlights: [
      "Negociações Justas: Transparência em cada centavo negociado na comunidade.",
      "Matemática de Valor: Uso das finanças para proteger o sustento econômico da vila.",
      "Exemplo de Integridade: Um legado onde o lucro anda de mãos dadas com a honestidade."
    ],
    image: "/images/legacy_val_toinho_1782477460824.jpg",
    imageAlt: "Toinho como um próspero e querido comerciante local no Povoado das Sete Colinas",
    audio: "/audio/pagina16.mp3",
    type: "content"
  },
  {
    id: 17,
    chapter: "Capítulo 7 - Parte II",
    title: "O Legado de Val e Toinho",
    subtitle: "Val, a Guardiã da Sabedoria",
    paragraphs: [
      "Val, mantendo vivo seu imenso amor pelos livros, nunca parou de estudar. Ela dedicou sua vida ao aprendizado profundo de botânica médica, astronomia agrícola e técnicas de organização civil e comunitária.",
      "Quando uma estranha e misteriosa febre atingiu as crianças do vale, foi a persistente Val quem passou noites em claro buscando referências em seus antigos livros até encontrar as ervas silvestres corretas para criar o xarope de cura.",
      "Em outra ocasião, quando as plantações de trigos da colina corriam sérios riscos devido a um longo período de seca e pragas, a sábia Val usou seus profundos mapas de astronomia e clima para orientar os agricultores sobre o momento exato do plantio.",
      "Val tornou-se a primeira grande Guardiã da Sabedoria do povoado, mostrando na prática que o estudo silencioso pode salvar vidas e alimentar centenas de famílias famintas."
    ],
    highlights: [
      "Medicina Tradicional de Plantas: Conhecimento ancestral catalogado para salvar vidas.",
      "Previsão de Safras Científica: Uso de cálculos de estrelas e estações para colheitas abundantes.",
      "Inspiração para Novas Gerações: O conhecimento compartilhado como tesouro público indestrutível."
    ],
    imageContextual: "/images/legacy_val_toinho_1782477460824.jpg",
    imageContextualAlt: "Val, a primeira Guardiã da Sabedoria do povoado, estudando botânica e astronomia",
    audio: "/audio/pagina17.mp3",
    type: "content"
  },
  {
    id: 18,
    chapter: "Epílogo",
    title: "Os Superpoderes da Vida",
    subtitle: "As Virtudes Que Todos Podem Carregar",
    paragraphs: [
      "Descubra as virtudes fundamentais que transformaram a vida prática de Toinho e Val, fazendo-os heróis queridos de toda a sua comunidade. Esses mesmos poderes estão ao alcance de cada um de nós hoje!",
      "Lembre-se sempre de cultivar essas sementes no seu dia a dia, pois o caráter de uma pessoa é formado pelas pequenas escolhas corretas de todas as manhãs."
    ],
    superpowers: [
      { num: 1, title: "Lealdade Sincera", desc: "Ser fiel a seus amigos e familiares sob qualquer circunstância, cumprindo sua palavra com verdade." },
      { num: 2, title: "Flexibilidade Mental", desc: "Saber se adaptar com humildade às mudanças sem se quebrar sob a pressão do orgulho." },
      { num: 3, title: "Riqueza Verdadeira", desc: "Valorizar diariamente a saúde, o alimento puro na mesa e o calor do amor de quem nos quer bem." },
      { num: 4, title: "Conhecimento Ativo", desc: "A busca infinita por aprender coisas novas, ler com atenção e observar o mundo com curiosidade." },
      { num: 5, title: "Rotina Produtiva", desc: "Fazer as suas tarefas diárias com pontualidade e dedicação, aproveitando as frutas maduras das oportunidades." },
      { num: 6, title: "Persistência Alegre", desc: "Nunca abandonar os estudos ou desistir sob dificuldades, sabendo que exercitar o cérebro fortalece a alma." }
    ],
    audio: "/audio/pagina18.mp3",
    type: "summary"
  },
  {
    id: 19,
    chapter: "Lançamento Volumes",
    title: "O Saber Não Tem Fim!",
    subtitle: "Uma Linda Jornada Está Apenas Começando",
    paragraphs: [
      "Parabéns, jovem leitor e educador! Você completou com grande sucesso a leitura da primeira grande jornada educacional de Toinho e Val: Volume 1.",
      "Esperamos que essas sementes de amizade e esforço façam morada permanente em suas mentes e corações, servindo de impulso para as tarefas escolares de cada dia.",
      "Fique muito atento! Os caminhos de nossos amigos reservarão ainda mais desafios e descobertas fantásticas:",
      "• No Volume 2 - A Floresta das Equações Perdidas: Uma perigosa aventura onde Toinho precisará usar suas habilidades de aritmética para desvendar um labirinto geométrico com a ajuda de Val.",
      "• No Volume 3 - O Guardião dos Pergaminhos Antigos: Val e Toinho viajam além das montanhas do vale para decifrar uma antiga profecia que envolve a sustentabilidade ecológica das águas do rio.",
      "Prepare-se, pois o conhecimento é verdadeiramente a maior e mais gratificante aventura de nossas vidas. Até o próximo volume!"
    ],
    audio: "/audio/pagina19.mp3",
    type: "conclusion"
  }
];
