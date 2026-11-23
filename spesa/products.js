// Elenco di prodotti per i suggerimenti automatici.
// "frigo" = cibo e bevande, "casa" = tutto il resto.
// Per aggiungerne altri scrivili nella categoria giusta, separati da virgola.

const CIBO = {
  verdura: `
Patate, Patate novelle, Patate dolci, Patate a pasta gialla, Patate a pasta bianca, Patate rosse,
Cipolle, Cipolle bianche, Cipolle gialle, Cipolle rosse, Cipolle di Tropea, Cipollotti, Scalogno, Porri, Aglio,
Carote, Sedano, Sedano rapa, Finocchi, Zucchine, Zucchine tonde, Fiori di zucca, Zucca, Zucca delica, Zucca butternut,
Melanzane, Melanzane tonde, Peperoni, Peperoni rossi, Peperoni gialli, Peperoni verdi, Friggitelli, Peperoncino fresco,
Pomodori, Pomodori ramati, Pomodori cuore di bue, Pomodori San Marzano, Pomodori costoluti, Pomodorini,
Pomodorini ciliegino, Pomodorini datterini, Pomodorini pachino, Cetrioli, Insalata, Insalata in busta, Insalata mista,
Lattuga, Lattuga iceberg, Lattuga romana, Valeriana, Songino, Rucola, Radicchio, Radicchio trevigiano, Indivia,
Scarola, Riccia, Cicoria, Catalogna, Puntarelle, Spinaci, Spinaci novelli, Bietole, Erbette, Cavolo, Cavolo cappuccio,
Cavolo verza, Cavolo nero, Cavolo rosso, Cavolfiore, Broccoli, Cime di rapa, Cavolini di Bruxelles, Carciofi,
Asparagi, Asparagi verdi, Asparagi bianchi, Fagiolini, Taccole, Piselli freschi, Fave fresche, Mais dolce,
Funghi, Funghi champignon, Funghi porcini, Funghi cardoncelli, Funghi shiitake, Barbabietole, Rape, Ravanelli,
Topinambur, Zenzero, Germogli di soia, Avocado, Olive fresche, Mix per minestrone, Verdure grigliate, Soffritto pronto`,

  erbe: `
Basilico, Prezzemolo, Rosmarino, Salvia, Timo, Origano, Origano secco, Menta, Maggiorana, Alloro, Erba cipollina,
Aneto, Coriandolo, Dragoncello, Finocchietto`,

  frutta: `
Mele, Mele Golden, Mele Fuji, Mele Gala, Mele Pink Lady, Mele Granny Smith, Mele Renette, Mele Stark, Mele Melinda,
Pere, Pere Abate, Pere Williams, Pere Kaiser, Pere Conference, Banane, Arance, Arance rosse, Arance da spremuta,
Arance tarocco, Mandarini, Clementine, Limoni, Lime, Pompelmi, Kiwi, Kiwi gold, Uva, Uva bianca, Uva nera, Uva rosa,
Fragole, Lamponi, Mirtilli, More, Ribes, Frutti di bosco, Ciliegie, Albicocche, Pesche, Pesche noci, Pesche tabacchiere,
Nettarine, Susine, Prugne, Fichi, Fichi d'India, Melone, Melone retato, Melone giallo, Anguria, Cocomero, Ananas,
Mango, Papaya, Cocco, Melograno, Cachi, Kaki mela, Castagne, Nespole, Frutto della passione, Litchi, Datteri,
Datteri Medjoul, Macedonia, Frutta sciroppata`,

  pasta: `
Pasta, Pasta di semola, Pasta integrale, Pasta all'uovo, Pasta senza glutine, Pasta di legumi, Pasta di farro,
Pasta di kamut, Pastina, Pastina stelline, Pastina anellini, Pastina ditalini, Pastina risoni, Pastina alfabeto,
Spaghetti, Spaghettini, Spaghettoni, Spaghetti alla chitarra, Vermicelli, Bucatini, Linguine, Bavette, Capellini,
Capelli d'angelo, Fettuccine, Tagliatelle, Tagliolini, Pappardelle, Lasagne, Lasagne all'uovo, Cannelloni,
Penne, Penne rigate, Penne lisce, Pennette, Mezze penne, Rigatoni, Mezzi rigatoni, Maccheroni, Tortiglioni,
Elicoidali, Sedani, Sedanini, Fusilli, Fusilli bucati, Fusilloni, Farfalle, Farfalline, Conchiglie, Conchiglioni,
Orecchiette, Cavatelli, Trofie, Strozzapreti, Casarecce, Gemelli, Paccheri, Mezze maniche, Ditali, Ditalini,
Tubetti, Lumache, Lumaconi, Gnocchetti sardi, Malloreddus, Pici, Ziti, Candele, Calamarata, Radiatori, Cellentani,
Mafalde, Reginette, Gramigna, Garganelli, Pizzoccheri, Tortellini, Tortelloni, Ravioli, Agnolotti, Cappelletti,
Gnocchi, Gnocchi di patate, Gnocchi di zucca, Gnocchi alla romana, Chicche, Noodles, Noodles di riso, Spaghetti di soia,
Udon, Ramen, Pasta fresca, Pasta ripiena`,

  riso_cereali: `
Riso, Riso Carnaroli, Riso Arborio, Riso Vialone Nano, Riso Roma, Riso Originario, Riso Ribe, Riso parboiled,
Riso basmati, Riso jasmine, Riso integrale, Riso venere, Riso rosso, Riso selvaggio, Riso per sushi, Riso soffiato,
Farro, Orzo, Orzo perlato, Couscous, Bulgur, Quinoa, Miglio, Grano saraceno, Amaranto, Polenta, Polenta istantanea,
Farina di mais, Avena, Fiocchi d'avena, Semola, Semolino`,

  forno: `
Pane, Pane comune, Pane integrale, Pane ai cereali, Pane di segale, Pane senza glutine, Pane casereccio, Pane toscano,
Pane pugliese, Pane di Altamura, Baguette, Rosette, Michette, Ciabatta, Filone, Panini, Panini al latte, Panini per hamburger,
Pane per hot dog, Pancarrè, Pane in cassetta, Pane per tramezzini, Piadine, Piadina sfogliata, Tortillas, Pita,
Focaccia, Focaccia genovese, Pizza bianca, Base per pizza, Grissini, Grissini torinesi, Crackers, Crackers integrali,
Crackers salati, Taralli, Taralli al finocchio, Friselle, Bruschette, Crostini, Pangrattato, Fette biscottate,
Fette biscottate integrali, Gallette di riso, Gallette di mais, Pane per bruschetta`,

  colazione_dolci: `
Biscotti, Biscotti secchi, Biscotti integrali, Biscotti al cioccolato, Biscotti frollini, Biscotti per bambini,
Cereali, Cereali al cioccolato, Corn flakes, Muesli, Granola, Cereali integrali, Riso soffiato al cioccolato,
Merendine, Cornetti, Croissant, Brioche, Brioche vuote, Brioche alla marmellata, Plumcake, Crostatine, Saccottini,
Pan di Spagna, Savoiardi, Pavesini, Wafer, Torta, Torta pronta, Ciambella, Muffin, Pancake, Fette di torta,
Marmellata, Confettura di albicocche, Confettura di fragole, Confettura di ciliegie, Confettura di frutti di bosco,
Marmellata di arance, Miele, Miele di acacia, Miele millefiori, Crema di nocciole, Crema spalmabile al pistacchio,
Burro di arachidi, Sciroppo d'acero, Cioccolato, Cioccolato al latte, Cioccolato fondente, Cioccolato bianco,
Cioccolato alle nocciole, Cioccolatini, Ovetti di cioccolato, Caramelle, Caramelle gommose, Liquirizia, Chewing gum,
Gelato, Gelato in vaschetta, Ghiaccioli, Coni gelato, Budino, Budino al cioccolato, Panna cotta, Tiramisù, Gelatina,
Panettone, Pandoro, Colomba, Torrone, Pandistelle, Amaretti, Cantucci, Meringhe, Barrette ai cereali, Barrette proteiche`,

  latticini: `
Latte, Latte intero, Latte parzialmente scremato, Latte scremato, Latte fresco, Latte UHT, Latte a lunga conservazione,
Latte senza lattosio, Latte di capra, Latte di soia, Latte di avena, Latte di mandorla, Latte di riso, Latte di cocco,
Bevanda vegetale, Panna, Panna da cucina, Panna fresca, Panna montata, Panna spray, Panna acida, Burro, Burro salato,
Burro chiarificato, Margarina, Yogurt, Yogurt bianco, Yogurt intero, Yogurt magro, Yogurt alla frutta, Yogurt greco,
Yogurt greco 0%, Yogurt da bere, Yogurt di soia, Kefir, Skyr, Uova, Uova biologiche, Uova grandi, Uova medie,
Albume`,

  formaggi: `
Parmigiano Reggiano, Grana Padano, Formaggio grattugiato, Pecorino, Pecorino romano, Pecorino sardo, Mozzarella,
Mozzarella di bufala, Mozzarella fior di latte, Mozzarella per pizza, Mozzarelline, Bocconcini, Burrata, Stracciatella,
Ricotta, Ricotta di pecora, Ricotta salata, Mascarpone, Stracchino, Crescenza, Robiola, Philadelphia,
Formaggio spalmabile, Fiocchi di latte, Primo sale, Scamorza, Scamorza affumicata, Provola, Provola affumicata,
Provolone, Caciocavallo, Fontina, Asiago, Montasio, Emmental, Gruyère, Edamer, Gouda, Taleggio, Gorgonzola,
Gorgonzola dolce, Gorgonzola piccante, Brie, Camembert, Feta, Halloumi, Sottilette, Fette di formaggio, Squacquerone,
Quartirolo, Caprino, Tomino, Castelmagno, Bitto`,

  salumi: `
Prosciutto cotto, Prosciutto crudo, Prosciutto di Parma, Prosciutto San Daniele, Speck, Bresaola, Mortadella,
Salame, Salame Milano, Salame Napoli, Salame piccante, Salamino, Spianata, Coppa, Capocollo, Lonza, Pancetta,
Pancetta a cubetti, Pancetta affumicata, Guanciale, Lardo, Fesa di tacchino, Petto di pollo a fette, Porchetta,
Cotechino, Zampone, Wurstel, Wurstel di pollo, Nduja, Culatello`,

  carne: `
Carne, Carne macinata, Macinato di manzo, Macinato misto, Macinato di pollo, Manzo, Bistecca, Fiorentina, Tagliata,
Controfiletto, Filetto di manzo, Roast beef, Fettine di manzo, Fettine di vitello, Scaloppine, Spezzatino, Bollito,
Brasato, Arrosto, Ossobuco, Hamburger, Hamburger di manzo, Hamburger di pollo, Polpette, Vitello, Vitello tonnato,
Maiale, Braciole di maiale, Costine di maiale, Lonza di maiale, Filetto di maiale, Salsiccia, Salsiccia di maiale,
Salamella, Pollo, Pollo intero, Petto di pollo, Fettine di pollo, Cosce di pollo, Sovracosce di pollo, Ali di pollo,
Fusi di pollo, Bocconcini di pollo, Cotolette di pollo, Crocchette di pollo, Nuggets di pollo, Tacchino, Petto di tacchino,
Fesa di tacchino fresca, Agnello, Costolette d'agnello, Coniglio, Anatra, Faraona, Cotolette, Involtini, Spiedini,
Fegato, Trippa`,

  pesce: `
Pesce, Salmone, Salmone fresco, Salmone affumicato, Tonno fresco, Pesce spada, Merluzzo, Baccalà, Stoccafisso,
Orata, Branzino, Spigola, Trota, Sogliola, Platessa, Nasello, Halibut, Sgombro, Alici, Acciughe, Sardine, Cernia,
Rombo, Dentice, Gamberi, Gamberetti, Mazzancolle, Scampi, Calamari, Totani, Seppie, Polpo, Moscardini, Cozze, Vongole,
Fasolari, Ostriche, Capesante, Granchio, Surimi, Bastoncini di pesce, Filetti di merluzzo, Frittura di pesce`,

  surgelati: `
Surgelati, Pizza surgelata, Piselli surgelati, Spinaci surgelati, Fagiolini surgelati, Minestrone surgelato,
Verdure surgelate, Patatine fritte surgelate, Patate al forno surgelate, Crocchette di patate, Sofficini,
Bastoncini di pesce surgelati, Gamberi surgelati, Misto mare surgelato, Lasagne surgelate, Gnocchi surgelati,
Frutti di bosco surgelati, Gelato surgelato, Torte surgelate, Croissant surgelati, Ghiaccio`,

  dispensa: `
Passata di pomodoro, Polpa di pomodoro, Pomodori pelati, Pomodorini in scatola, Concentrato di pomodoro, Sugo pronto,
Sugo al basilico, Ragù, Ragù pronto, Pesto, Pesto alla genovese, Pesto rosso, Besciamella, Tonno in scatola,
Tonno all'olio d'oliva, Tonno al naturale, Sgombro in scatola, Salmone in scatola, Acciughe sott'olio, Sardine in scatola,
Carne in scatola, Legumi, Fagioli, Fagioli borlotti, Fagioli cannellini, Fagioli neri, Fagioli rossi, Ceci, Lenticchie,
Lenticchie rosse, Piselli in scatola, Fave secche, Lupini, Edamame, Soia, Mais in scatola, Olive, Olive verdi,
Olive nere, Olive taggiasche, Capperi, Carciofini sott'olio, Funghi sott'olio, Sottaceti, Cetriolini, Giardiniera,
Pomodori secchi, Peperoni sott'olio, Melanzane sott'olio, Brodo, Brodo granulare, Dado, Dado vegetale, Dado di carne,
Brodo vegetale pronto, Zuppa pronta, Vellutata, Minestra, Purè istantaneo, Hummus, Tofu, Tempeh, Seitan, Burger vegetale`,

  condimenti: `
Olio extravergine di oliva, Olio di oliva, Olio di semi, Olio di semi di girasole, Olio di arachidi, Olio di mais,
Olio di cocco, Olio per friggere, Aceto, Aceto di vino bianco, Aceto di vino rosso, Aceto di mele, Aceto balsamico,
Glassa di aceto balsamico, Sale, Sale fino, Sale grosso, Sale iodato, Sale rosa, Pepe, Pepe nero, Pepe bianco,
Peperoncino, Peperoncino secco, Paprika, Paprika dolce, Paprika affumicata, Curry, Curcuma, Cumino, Cannella,
Noce moscata, Chiodi di garofano, Zafferano, Vaniglia, Vanillina, Semi di finocchio, Semi di sesamo, Semi di chia,
Semi di lino, Semi di girasole, Semi di zucca, Spezie, Ketchup, Maionese, Senape, Salsa barbecue, Salsa di soia,
Salsa tonnata, Salsa rosa, Salsa yogurt, Tabasco, Salsa worcester, Guacamole, Tahina, Pinoli`,

  cucina: `
Farina, Farina 00, Farina 0, Farina integrale, Farina manitoba, Farina di riso, Farina di farro, Farina di ceci,
Farina di mandorle, Farina per pizza, Fecola di patate, Amido di mais, Maizena, Lievito, Lievito di birra,
Lievito di birra secco, Lievito per dolci, Bicarbonato, Zucchero, Zucchero semolato, Zucchero di canna, Zucchero a velo,
Dolcificante, Stevia, Cacao amaro, Gocce di cioccolato, Codette colorate, Colla di pesce, Pasta sfoglia, Pasta brisé,
Pasta frolla, Pasta per pizza, Pasta fillo, Latte condensato, Uvetta, Canditi, Panna vegetale`,

  frutta_secca_snack: `
Frutta secca, Noci, Nocciole, Mandorle, Mandorle pelate, Pistacchi, Anacardi, Arachidi, Arachidi salate, Noci pecan,
Noci brasiliane, Noci di macadamia, Albicocche secche, Prugne secche, Fichi secchi, Mirtilli rossi secchi, Mix di frutta secca,
Patatine, Patatine classiche, Patatine paprika, Chips di mais, Tortilla chips, Popcorn, Salatini, Arachidi tostate,
Snack, Bruschettine`,

  bevande: `
Acqua, Acqua naturale, Acqua frizzante, Acqua leggermente frizzante, Acqua in bottiglia, Acqua tonica, Coca Cola,
Coca Cola Zero, Pepsi, Aranciata, Limonata, Chinotto, Gassosa, Sprite, Fanta, Tè freddo, Tè freddo al limone,
Tè freddo alla pesca, Succo di frutta, Succo d'arancia, Succo di mela, Succo ACE, Succo di pera, Succo di pesca,
Succo di ananas, Spremuta, Spremuta d'arancia, Centrifugato, Smoothie, Energy drink, Bevanda isotonica,
Caffè, Caffè macinato, Caffè in grani, Caffè in capsule, Caffè in cialde, Caffè decaffeinato, Caffè solubile, Orzo solubile,
Ginseng, Tè, Tè nero, Tè verde, Tè in bustine, Camomilla, Tisana, Infuso, Cioccolata calda, Cacao solubile,
Birra, Birra in bottiglia, Birra in lattina, Birra analcolica, Vino, Vino rosso, Vino bianco, Vino rosato, Prosecco,
Spumante, Champagne, Lambrusco, Aperol, Campari, Spritz, Gin, Vodka, Rum, Whisky, Limoncello, Amaro, Grappa, Martini,
Vermouth, Liquore, Sciroppo per bibite`,

  bambini: `
Omogeneizzati, Latte in polvere, Pappe, Crema di riso, Merende per bambini`,
};

const CASA = {
  pulizia: `
Detersivo piatti, Detersivo piatti a mano, Pastiglie lavastoviglie, Detersivo lavastoviglie, Gel lavastoviglie,
Brillantante, Sale lavastoviglie, Pulitore lavastoviglie, Detersivo lavatrice, Detersivo lavatrice liquido,
Detersivo lavatrice in polvere, Capsule lavatrice, Detersivo per lana, Detersivo per capi delicati, Detersivo per capi scuri,
Ammorbidente, Profumatore bucato, Smacchiatore, Sbiancante, Candeggina, Acchiappacolore, Anticalcare lavatrice,
Anticalcare, Sgrassatore, Sgrassatore cucina, Detergente pavimenti, Detergente parquet, Detergente bagno,
Detergente WC, Gel WC, Tavolette WC, Detergente vetri, Detergente multiuso, Detergente acciaio, Detergente forno,
Disincrostante, Disgorgante, Igienizzante, Spray igienizzante, Salviette igienizzanti, Alcool denaturato,
Aceto per pulizie, Bicarbonato per pulizie, Acido citrico, Cera per pavimenti, Lucidante mobili, Antipolvere,
Spugne, Spugne abrasive, Spugne in acciaio, Panni in microfibra, Panno per vetri, Strofinacci, Guanti di gomma,
Guanti monouso, Scopa, Mocio, Ricambio mocio, Lavapavimenti, Paletta, Secchio, Piumino antipolvere, Scopino WC,
Spazzolone`,

  carta_cucina: `
Carta igienica, Carta da cucina, Rotoloni, Fazzoletti, Fazzoletti di carta, Tovaglioli, Tovaglioli di carta,
Tovaglie di carta, Pellicola trasparente, Carta forno, Carta stagnola, Carta alluminio, Sacchetti gelo,
Sacchetti per alimenti, Sacchetti zip, Vaschette di alluminio, Contenitori per alimenti, Sacchi spazzatura,
Sacchi indifferenziata, Sacchetti umido, Sacchetti compostabili, Sacchi plastica, Sacchi carta, Bicchieri di plastica,
Bicchieri di carta, Piatti di plastica, Piatti di carta, Posate di plastica, Cannucce, Stuzzicadenti, Spiedini di legno,
Filtri per caffè, Accendigas, Fiammiferi, Accendino, Pastiglie accendifuoco, Carbonella`,

  igiene: `
Shampoo, Shampoo antiforfora, Balsamo, Maschera capelli, Bagnoschiuma, Docciaschiuma, Sapone, Sapone mani,
Sapone liquido, Saponetta, Ricarica sapone, Gel igienizzante mani, Deodorante, Deodorante spray, Deodorante roll-on,
Dentifricio, Spazzolino, Testine spazzolino elettrico, Filo interdentale, Collutorio, Scovolini, Cotton fioc,
Dischetti di cotone, Cotone idrofilo, Struccante, Acqua micellare, Salviette struccanti, Crema viso, Crema mani,
Crema corpo, Crema solare, Doposole, Burrocacao, Assorbenti, Assorbenti interni, Salvaslip, Coppetta mestruale,
Intimo detergente, Rasoi, Lamette, Schiuma da barba, Gel da barba, Dopobarba, Ceretta, Strisce depilatorie,
Lacca, Gel capelli, Mousse capelli, Tinta capelli, Elastici per capelli, Forcine, Profumo, Smalto, Solvente unghie,
Lima unghie, Pettine, Spazzola, Salviette umidificate, Fazzolettini umidificati, Talco, Pannolini, Salviette bambini,
Preservativi, Test di gravidanza, Lenti a contatto, Liquido lenti`,

  farmacia: `
Cerotti, Garze, Disinfettante, Acqua ossigenata, Termometro, Tachipirina, Paracetamolo, Ibuprofene, Moment, Oki,
Aspirina, Antistaminico, Spray nasale, Collirio, Sciroppo per la tosse, Caramelle per la gola, Fermenti lattici,
Integratori, Vitamine, Magnesio, Antizanzare, Crema per punture, Ghiaccio istantaneo, Mascherine`,

  casa_varie: `
Lampadine, Lampadine LED, Pile, Pile stilo AA, Pile ministilo AAA, Batterie, Candele, Candele profumate,
Deodorante per ambienti, Profumatore per ambienti, Diffusore, Ricarica diffusore, Insetticida, Zampironi,
Piastrine antizanzare, Trappole per formiche, Antitarme, Ricarica deumidificatore, Mollette, Grucce, Stendibiancheria,
Acqua demineralizzata, Appretto, Ago e filo, Nastro adesivo, Scotch, Colla, Forbici, Penne a sfera, Matite,
Quaderno, Post-it, Buste, Francobolli`,

  animali: `
Cibo per gatti, Cibo per cani, Crocchette per gatti, Crocchette per cani, Scatolette per gatti, Bustine per gatti,
Snack per gatti, Snack per cani, Lettiera, Lettiera gatto, Sacchetti per cani, Antiparassitario, Tappetini per cani`,
};

const parse = (txt, place) => txt.split(",").map((s) => s.trim()).filter(Boolean).map((name) => ({ name, place }));

// Elenco unico, senza doppioni
const seen = new Set();
export const PRODUCTS = [
  ...Object.values(CIBO).flatMap((t) => parse(t, "frigo")),
  ...Object.values(CASA).flatMap((t) => parse(t, "casa")),
].filter((p) => { const k = p.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });

// I più comuni: compaiono per primi nei suggerimenti
export const POPULAR = new Set(`Acqua naturale, Acqua frizzante, Banane, Biscotti, Burro, Caffè, Carne macinata, Carote,
Cipolle, Cipolle bianche, Cipolle gialle, Cipolle rosse, Detersivo piatti, Formaggio grattugiato, Insalata, Latte,
Limoni, Mele, Mozzarella, Olio extravergine di oliva, Pane, Pasta, Patate, Petto di pollo, Pomodori, Pomodorini,
Prosciutto cotto, Prosciutto crudo, Riso, Sale, Tonno in scatola, Uova, Yogurt, Zucchine, Zucchero, Carta igienica,
Carta da cucina, Sacchi spazzatura, Shampoo, Dentifricio, Passata di pomodoro, Parmigiano Reggiano, Pizza surgelata,
Spaghetti, Penne, Rigatoni, Fusilli, Pastina, Peperoni, Melanzane, Salmone, Fette biscottate, Farina, Fagioli, Ceci,
Pollo, Arance, Fragole, Gelato, Birra, Vino rosso, Vino bianco, Bagnoschiuma, Sapone mani, Pastiglie lavastoviglie,
Detersivo lavatrice, Ammorbidente, Fazzoletti, Cereali, Marmellata, Grana Padano, Ricotta, Salame, Insalata in busta`
  .split(",").map((s) => s.trim().toLowerCase()));
