# Ferramenta de Treemap para Visualização dos Dados de Jogadores Simultâneos na Steam

## Descrição

Esta ferramenta foi desenvolvida para visualizar os dados dos jogadores simultâneos nas últimas 24 horas dos jogos mais jogados na Steam. Utilizando uma combinação de HTML, JavaScript, jQuery e CSS, a ferramenta exibe os dados em um treemap, proporcionando uma visualização clara e intuitiva da popularidade dos jogos.
Funcionalidades

#### Treemap Interativo:
O treemap representa os dados de forma hierárquica, onde cada retângulo representa um jogo e o tamanho é proporcional ao número de jogadores simultâneos.
Através do uso de cores e tamanhos variados, o usuário pode facilmente identificar quais jogos possuem maior ou menor número de jogadores.

#### Seleção de Top List:
A ferramenta permite ao usuário selecionar a quantidade de jogos que serão exibidos no treemap através de um menu dropdown. As opções disponíveis são: Top 10, Top 25, Top 50, Top 75 e Top 100.
Esta funcionalidade proporciona uma personalização da visualização de acordo com a necessidade do usuário.

#### Atualização Automática dos Dados:
Um endpoint foi criado em uma API personalizada para realizar o web scraping da página https://store.steampowered.com/charts/mostplayed.
Este endpoint coleta os dados dos jogadores simultâneos e os armazena em um arquivo JSON, nomeado com a data atual (por exemplo, 2024-08-06-10.json).
O sistema verifica se o arquivo já existe para evitar a duplicação de dados e garantir a eficiência.

#### Tecnologias Utilizadas

- HTML: Estrutura básica da página e elementos do treemap.
- CSS: Estilização dos elementos, incluindo cores e layouts do treemap.
- JavaScript e jQuery: Manipulação dinâmica do DOM, coleta e processamento dos dados - JSON, e renderização do treemap.
- Endpoint API: Realização do web scraping, coleta de dados da página Steam e armazenamento em arquivos JSON.

#### Detalhes do Endpoint

    URL do Endpoint: https://live-interactions.vercel.app/api/v1/games/most-played?top=[top]
    Método: GET
    Query: top
    Padrão: 10
    Descrição: O endpoint realiza a coleta dos dados de jogadores simultâneos diretamente da página Steam Charts. Se o arquivo com os dados para a data atual já existir, o scraping não é repetido.

#### Benefícios

- Visualização Eficiente: O treemap permite uma visualização rápida e clara dos dados, facilitando a identificação dos jogos mais populares.
- Personalização: A opção de selecionar diferentes tops (10, 25, 50, 75, 100) permite que os usuários ajustem a visualização conforme suas necessidades.
- Automação: A coleta automática de dados garante que as informações estejam sempre atualizadas sem intervenção manual.
- Escalabilidade: A ferramenta pode ser facilmente adaptada para incluir mais dados ou diferentes tipos de visualização conforme necessário.
