// Elenco di prodotti comuni per i suggerimenti automatici.
// "frigo" = cibo e bevande, "casa" = tutto il resto. Aggiungine pure altri.

const CIBO = `
Acqua naturale, Acqua frizzante, Aceto, Aceto balsamico, Aglio, Albicocche, Alici, Ananas, Anguria, Arance,
Aranciata, Arachidi, Asparagi, Avocado, Avena, Baccalà, Banane, Barrette ai cereali, Basilico, Bastoncini di pesce,
Besciamella, Bietole, Birra, Biscotti, Bistecca, Bresaola, Briosche, Broccoli, Brodo granulare, Burrata, Burro,
Burro di arachidi, Cacao, Caffè, Caffè in capsule, Caffè macinato, Camomilla, Capperi, Carciofi, Carne macinata,
Carote, Castagne, Cavolfiore, Cavolo, Cavolo nero, Ceci, Cereali, Cetrioli, Chips, Cicoria, Ciliegie, Cioccolato,
Cioccolato fondente, Cipolle, Cipolle rosse, Cocomero, Coca Cola, Confettura, Coniglio, Cornetti, Cotechino,
Cotolette, Couscous, Cracker, Crema di nocciole, Crescenza, Crostatine, Cus cus, Datteri, Dado, Emmental,
Erba cipollina, Fagioli, Fagioli borlotti, Fagiolini, Farina, Farina 00, Farina integrale, Fesa di tacchino,
Fette biscottate, Fichi, Filetto di maiale, Finocchi, Fiocchi di latte, Fontina, Formaggio grattugiato,
Fragole, Frutti di bosco, Funghi, Funghi champignon, Gamberi, Gelato, Gnocchi, Gorgonzola, Grana Padano,
Grissini, Hamburger, Insalata, Insalata in busta, Kiwi, Ketchup, Lamponi, Lasagne, Latte, Latte intero,
Latte parzialmente scremato, Latte di soia, Latte di avena, Latte di mandorla, Lattuga, Legumi, Lenticchie,
Lievito, Lievito di birra, Limoni, Lime, Maionese, Mais, Mandarini, Mandorle, Mango, Marmellata, Mascarpone,
Melanzane, Mele, Melone, Merendine, Merluzzo, Miele, Minestrone surgelato, Mirtilli, Mortadella, Mozzarella,
Mozzarella di bufala, Muesli, Nocciole, Noci, Olio di semi, Olio extravergine di oliva, Olive, Olive nere,
Olive verdi, Orata, Origano, Orzo, Pancarrè, Pancetta, Pane, Pane integrale, Pane in cassetta, Pangrattato,
Panna da cucina, Panna montata, Parmigiano Reggiano, Pasta, Pasta all'uovo, Pasta integrale, Pasta sfoglia,
Pasta brisé, Pasta frolla, Passata di pomodoro, Patate, Patatine, Pecorino, Pepe, Peperoncino, Peperoni,
Pere, Pesce spada, Pesche, Pesto, Petto di pollo, Philadelphia, Piadine, Piselli, Piselli surgelati, Pistacchi,
Pizza surgelata, Polenta, Pollo, Polpa di pomodoro, Polpo, Pomodori, Pomodorini, Pomodori pelati, Porri,
Prezzemolo, Prosciutto cotto, Prosciutto crudo, Provola, Prugne, Radicchio, Ragù, Ravioli, Ricotta, Riso,
Riso basmati, Riso per risotto, Robiola, Rosmarino, Rucola, Salame, Sale, Sale grosso, Salmone, Salmone affumicato,
Salsiccia, Salvia, Sardine, Scamorza, Scaloppine, Sedano, Semi di chia, Senape, Sgombro, Spaghetti, Speck,
Spinaci, Spinaci surgelati, Spremuta, Stracchino, Succo di frutta, Sugo pronto, Surgelati, Taleggio, Tè,
Tè freddo, Tisana, Tofu, Tonno, Tonno in scatola, Torta, Tortellini, Tramezzini, Uova, Uva, Vino bianco,
Vino rosso, Prosecco, Wurstel, Yogurt, Yogurt greco, Zafferano, Zenzero, Zucca, Zucchero, Zucchero di canna,
Zucchine, Würstel di pollo, Bevanda vegetale, Burger vegetale, Hummus, Quinoa, Farro, Polpette, Arrosto,
Fettine di vitello, Spezzatino, Cosce di pollo, Ali di pollo, Tacchino, Vongole, Cozze, Calamari, Seppie,
Branzino, Trota, Halloumi, Feta, Asiago, Brie, Caciocavallo, Sottilette, Formaggio spalmabile, Gelatina,
Budino, Panettone, Pandoro, Colomba, Croissant, Pan di Spagna, Savoiardi, Wafer, Cioccolatini, Caramelle,
Gomme da masticare, Popcorn, Taralli, Frutta secca, Uvetta, Sciroppo, Acqua tonica, Energy drink, Latte condensato,
Panna acida, Salsa di soia, Tabasco, Curry, Paprika, Cannella, Noce moscata, Vaniglia, Bicarbonato, Amido di mais,
Gnocchi di patate, Fusilli, Penne, Rigatoni, Farfalle, Linguine, Tagliatelle, Orecchiette,
Mezze maniche, Pastina, Noodles, Piadina, Focaccia, Taralli pugliesi, Friselle, Gallette di riso, Mozzarelline
`;

const CASA = `
Carta igienica, Carta da cucina, Scottex, Fazzoletti, Tovaglioli, Detersivo piatti, Pastiglie lavastoviglie,
Brillantante, Sale lavastoviglie, Detersivo lavatrice, Ammorbidente, Candeggina, Smacchiatore, Anticalcare,
Sgrassatore, Detergente pavimenti, Detergente bagno, Detergente vetri, Alcool, Spugne, Panni in microfibra,
Guanti di gomma, Sacchi spazzatura, Sacchetti umido, Sacchetti gelo, Pellicola trasparente, Carta forno,
Carta stagnola, Alluminio, Bicchieri di plastica, Piatti di carta, Posate di plastica, Stuzzicadenti,
Shampoo, Balsamo, Bagnoschiuma, Docciaschiuma, Sapone mani, Sapone liquido, Deodorante, Dentifricio,
Spazzolino, Filo interdentale, Collutorio, Cotton fioc, Dischetti struccanti, Assorbenti, Salvaslip,
Rasoi, Schiuma da barba, Crema viso, Crema corpo, Crema solare, Lacca, Gel capelli, Profumo, Struccante,
Cerotti, Disinfettante, Tachipirina, Ibuprofene, Termometro, Fazzolettini umidificati, Salviette, Pannolini,
Lampadine, Pile, Batterie, Candele, Fiammiferi, Accendino, Insetticida, Zampironi, Deodorante per ambienti,
Profumatore, Lettiera gatto, Cibo per gatti, Cibo per cani, Crocchette, Mollette, Scopa, Mocio, Paletta,
Secchio, Stendibiancheria, Grucce, Ago e filo, Nastro adesivo, Colla, Penne a sfera, Scotch
`;

const parse = (txt, place) => txt.split(",").map((s) => s.trim()).filter(Boolean).map((name) => ({ name, place }));

// I più comuni: compaiono per primi nei suggerimenti
export const POPULAR = new Set(`Acqua naturale, Banane, Biscotti, Burro, Caffè, Carne macinata, Carote, Cipolle, Detersivo piatti,
Formaggio grattugiato, Insalata, Latte, Limoni, Mele, Mozzarella, Olio extravergine di oliva, Pane, Pasta, Patate,
Petto di pollo, Pomodori, Prosciutto cotto, Riso, Sale, Tonno in scatola, Uova, Yogurt, Zucchine, Zucchero,
Carta igienica, Carta da cucina, Sacchi spazzatura, Shampoo, Dentifricio, Passata di pomodoro, Parmigiano Reggiano,
Prosciutto crudo, Pizza surgelata, Spaghetti, Penne, Peperoni, Pesce spada, Salmone, Fette biscottate`
  .split(",").map((s) => s.trim().toLowerCase()));

export const PRODUCTS = [...parse(CIBO, "frigo"), ...parse(CASA, "casa")];
