// seeds/01_import_rovereto_schools.js

export async function seed(knex) {
  // Get the school types and educational paths to link with
  const schoolTypes = await knex("school_types").select("id", "name");
  const educationalPaths = await knex("educational_paths").select("id", "name");

  // Create type ID maps for easy lookup
  const typeIdMap = schoolTypes.reduce((map, type) => {
    map[type.name.toLowerCase()] = type.id;
    return map;
  }, {});

  // Create path ID maps for easy lookup (case insensitive for flexible matching)
  const pathIdMap = educationalPaths.reduce((map, path) => {
    map[path.name.toLowerCase()] = path.id;
    return map;
  }, {});

  // Define mapping functions to classify schools by type
  const determineSchoolType = (name, indirizzi) => {
    const nameLower = name.toLowerCase();

    if (nameLower.includes("liceo")) {
      return typeIdMap["liceo"];
    } else if (
      nameLower.includes("istituto tecnico") ||
      nameLower.includes("itet")
    ) {
      return typeIdMap["istituto tecnico"];
    } else if (
      nameLower.includes("istituto professionale") ||
      nameLower.includes("ifp")
    ) {
      return typeIdMap["istituto professionale"];
    } else if (
      nameLower.includes("cfp") ||
      nameLower.includes("formazione professionale")
    ) {
      return typeIdMap["scuola professionale"];
    } else {
      // Default to technical institute if unsure
      return typeIdMap["istituto tecnico"];
    }
  };

  // Helper function to find path ID based on name (fuzzy match)
  const findEducationalPathId = (pathName) => {
    const lowerName = pathName.toLowerCase();

    // Direct match first
    if (pathIdMap[lowerName]) {
      return pathIdMap[lowerName];
    }

    // Try to find partial matches
    if (lowerName.includes("classi")) return pathIdMap["classico"];
    if (lowerName.includes("scienti")) return pathIdMap["scientifico"];
    if (lowerName.includes("linguist")) return pathIdMap["linguistico"];
    if (lowerName.includes("scienze umane")) return pathIdMap["scienze umane"];
    if (lowerName.includes("artist")) return pathIdMap["artistico"];
    if (lowerName.includes("music")) return pathIdMap["musicale"];
    if (lowerName.includes("tecnolog") || lowerName.includes("tecnic"))
      return pathIdMap["tecnologico"];
    if (lowerName.includes("econom")) return pathIdMap["economico"];
    if (lowerName.includes("albergh")) return pathIdMap["alberghiero"];
    if (
      lowerName.includes("industrial") ||
      lowerName.includes("meccanic") ||
      lowerName.includes("elettronic")
    )
      return pathIdMap["industriale"];

    // If no match, try to create a new path
    console.log(`No matching educational path found for: ${pathName}`);
    return null;
  };

  // Process school data from JSON files
  const schoolsData = [
    // Istituto Alberghiero
    {
      name: "Istituto di Formazione Professionale Alberghiero",
      miur_code: "TNCF011001",
      type: typeIdMap["istituto professionale"],
      website_url: "https://www.alberghierorovereto.it",
      description:
        "Formazione professionale nel settore alberghiero e della ristorazione",
      address: "Viale Dei Colli, 17 - 38068 ROVERETO",
      geo_location: { lat: 45.89080798116856, lng: 11.048049058366294 },
      responsabile_orientamento: "Susy Severi",
      main_campus: true,
      canteen: true,
      boarding: false,
      emails: [
        {
          description: "orientamento",
          email: "ifparovereto.orientamento@scuole.provincia.tn.it",
        },
        { description: "istituto", email: "ifpa.rovereto@pec.provincia.tn.it" },
        {
          description: "segreteria",
          email: "segr.ifpa.rovereto@scuole.provincia.tn.it",
        },
        {
          description: "dirigenza",
          email: "dir.ifpa.rovereto@scuole.provincia.tn.it",
        },
      ],
      phones: [
        { description: "telefono", number: "+39 0464 439164" },
        { description: "fax", number: "+39 0464 435851" },
      ],
      educational_paths: [
        {
          name: "Indirizzo della panificazione e di pasticceria",
          link: "https://www.alberghierorovereto.it/formazione/qualifica/3-op-panificazione-e-pasticceria/",
        },
        {
          name: "Indirizzo di cucina",
          link: "https://www.alberghierorovereto.it/formazione/qualifica/gastronomia-e-arte-bianca/",
        },
        {
          name: "Indirizzo dei servizi di sala e bar",
          link: "https://www.alberghierorovereto.it/formazione/qualifica/accoglienza-e-ospitalita/",
        },
      ],
      events: [
        {
          title: "Open Day",
          description:
            "È gradita la prenotazione sul modulo al seguente https://forms.gle/2FwJqMkTXqqeWeDZA",
          start_date: new Date("2024-12-06T14:30:00+01:00"),
          end_date: new Date("2024-12-06T17:30:00+01:00"),
          location: "Viale Dei Colli, 17 - Rovereto",
          is_online: false,
          miur_code: "TNCF011001",
        },
        {
          title: "Open Day",
          description:
            "È gradita la prenotazione sul modulo al seguente https://forms.gle/2FwJqMkTXqqeWeDZA",
          start_date: new Date("2024-12-14T10:00:00+01:00"),
          end_date: new Date("2024-12-14T13:00:00+01:00"),
          location: "Viale Dei Colli, 17 - Rovereto",
          is_online: false,
          miur_code: "TNCF011001",
        },
      ],
    },

    // Liceo Arcivescovile
    {
      name: "Liceo Internazionale Arcivescovile",
      miur_code: "TN1M00200X",
      type: typeIdMap["liceo"],
      website_url: "https://www.arcivescoviletrento.it",
      description:
        "Liceo internazionale con focus sull'apprendimento delle lingue",
      address: "Corso Bettini, 71 - 38068 ROVERETO",
      geo_location: { lat: 45.896796472675156, lng: 11.044075139109527 },
      responsabile_orientamento: "Paolo Dordoni",
      main_campus: true,
      canteen: true,
      boarding: true,
      emails: [
        {
          description: "orientamento",
          email: "paolodordoni@arcivescoviletrento.it",
        },
        { description: "istituto", email: "collegioarcivescovile@pec.it" },
        { description: "segreteria", email: "lia@arcivescoviletrento.it" },
        {
          description: "dirigenza",
          email: "dameinglesi@arcivescoviletrento.it",
        },
      ],
      phones: [
        { description: "telefono", number: "+39 0464 406000" },
        { description: "fax", number: "+39 0464 406077" },
      ],
      educational_paths: [
        {
          name: "Indirizzo linguistico",
          link: "https://www.arcivescoviletrento.it/wp-content/uploads/2021/10/tabella-orario.pdf",
        },
      ],
      events: [
        {
          title: "LIA DAY - Scuola Aperta",
          description:
            "Presentazione indirizzi, visita alla scuola. In presenza",
          start_date: new Date("2024-11-23T14:00:00+01:00"),
          end_date: new Date("2024-11-23T18:00:00+01:00"),
          location: "Corso Bettini, 71 - Rovereto",
          is_online: false,
          miur_code: "TN1M00200X",
        },
        {
          title: "LIA DAY - Scuola Aperta",
          description:
            "Presentazione indirizzi, visita alla scuola. In presenza",
          start_date: new Date("2024-12-14T14:00:00+01:00"),
          end_date: new Date("2024-12-14T18:00:00+01:00"),
          location: "Corso Bettini, 71 - Rovereto",
          is_online: false,
          miur_code: "TN1M00200X",
        },
        {
          title: "LIA DAY - Scuola Aperta",
          description:
            "Presentazione indirizzi, visita alla scuola. In presenza",
          start_date: new Date("2025-01-11T14:00:00+01:00"),
          end_date: new Date("2025-01-11T18:00:00+01:00"),
          location: "Corso Bettini, 71 - Rovereto",
          is_online: false,
          miur_code: "TN1M00200X",
        },
      ],
    },

    // CFP Opera Armida Barelli
    {
      name: "CFP Opera Armida Barelli",
      miur_code: "TNCF005001",
      type: typeIdMap["scuola professionale"],
      website_url: "https://www.operaarmidabarelli.org",
      description: "Centro di formazione professionale con vari indirizzi",
      address: "Via Setaioli, 5 - 38068 ROVERETO",
      geo_location: { lat: 45.887305, lng: 11.042172 },
      responsabile_orientamento: "Donatella Sartori",
      main_campus: true,
      canteen: false,
      boarding: false,
      emails: [
        {
          description: "orientamento",
          email: "orientamentorovereto@operaarmidabarelli.org",
        },
        {
          description: "istituto",
          email: "cfprovereto@pec.operaarmidabarelli.org",
        },
        {
          description: "segreteria",
          email: "cfprovereto@operaarmidabarelli.org",
        },
      ],
      phones: [
        { description: "telefono", number: "+39 0464 433771" },
        { description: "fax", number: "+39 0464 431711" },
      ],
      educational_paths: [],
      events: [
        {
          title: "Open Day",
          description:
            "In presenza. Presentazione dell'offerta formativa e visita della scuola. Prenotazione sul sito della scuola",
          start_date: new Date("2024-12-07T14:00:00+01:00"),
          end_date: new Date("2024-12-07T15:00:00+01:00"),
          location: "Via Setaioli, 5 - Rovereto",
          is_online: false,
          miur_code: "TNCF005001",
        },
        {
          title: "Open Day",
          description:
            "In presenza. Presentazione dell'offerta formativa e visita della scuola. Prenotazione sul sito della scuola",
          start_date: new Date("2024-12-07T15:00:00+01:00"),
          end_date: new Date("2024-12-07T16:00:00+01:00"),
          location: "Via Setaioli, 5 - Rovereto",
          is_online: false,
          miur_code: "TNCF005001",
        },
        {
          title: "Open Day",
          description:
            "In presenza. Presentazione dell'offerta formativa e visita della scuola. Prenotazione sul sito della scuola",
          start_date: new Date("2025-01-18T14:00:00+01:00"),
          end_date: new Date("2025-01-18T15:00:00+01:00"),
          location: "Via Setaioli, 5 - Rovereto",
          is_online: false,
          miur_code: "TNCF005001",
        },
      ],
    },

    // Liceo delle Arti Depero
    {
      name: "Liceo delle Arti Depero",
      miur_code: "TNSD020011",
      type: typeIdMap["liceo"],
      website_url: "https://www.liceodellearti.tn.it",
      description: "Liceo artistico con focus su grafica, design e multimedia",
      address: "Via Delle Fosse, 9 - 38068 ROVERETO",
      geo_location: { lat: 45.887376, lng: 11.045916 },
      responsabile_orientamento: "Chiara Miorelli",
      main_campus: true,
      canteen: false,
      boarding: false,
      emails: [
        {
          description: "orientamento",
          email: "orientamento.depero@liceodellearti.tn.it",
        },
        { description: "istituto", email: "info@liceodellearti.tn.it" },
        {
          description: "segreteria",
          email: "segreteria.depero@liceodellearti.tn.it",
        },
      ],
      phones: [
        { description: "telefono", number: "+39 0464 438836" },
        { description: "fax", number: "+39 0461 824345" },
      ],
      educational_paths: [
        {
          name: "Grafica",
          link: "https://www.liceodellearti.tn.it/wp-content/uploads/2023/11/Depero-Grafica.pdf",
        },
        {
          name: "Design per l'innovazione",
          link: "https://www.liceodellearti.tn.it/wp-content/uploads/2023/11/Depero-Design.pdf",
        },
        {
          name: "Audiovisivo multimediale",
          link: "https://www.liceodellearti.tn.it/wp-content/uploads/2023/11/Depero-Audiovisivo.pdf",
        },
      ],
      events: [
        {
          title: "Open Day",
          description:
            "Presentazione dell'offerta formativa e visita alla scuola presso succursale del biennio, via Balista 2. Prenotazione obbligatoria al https://lc.cx/pF94a4",
          start_date: new Date("2024-11-16T10:00:00+01:00"),
          end_date: new Date("2024-11-16T12:30:00+01:00"),
          location: "Via Balista, 2 - Rovereto",
          is_online: false,
          miur_code: "TNSD020011",
        },
        {
          title: "Open Day",
          description:
            "Presentazione dell'offerta formativa e visita alla scuola presso succursale del biennio, via Balista 2. Prenotazione obbligatoria al https://lc.cx/pF94a4",
          start_date: new Date("2024-12-07T10:00:00+01:00"),
          end_date: new Date("2024-12-07T12:30:00+01:00"),
          location: "Via Balista, 2 - Rovereto",
          is_online: false,
          miur_code: "TNSD020011",
        },
      ],
    },

    // Istituto Don Milani
    {
      name: "Istituto d'Istruzione 'Don Milani'",
      miur_code: "TNIS009009",
      type: typeIdMap["istituto tecnico"],
      website_url: "https://www.domir.edu.it",
      description:
        "Istituto con indirizzi tecnico turistico e professionale per i servizi socio-sanitari",
      address: "Via Balista, 6 - 38068 ROVERETO",
      geo_location: { lat: 45.89467684881463, lng: 11.032274219398017 },
      responsabile_orientamento: "Sonja Patisso",
      main_campus: true,
      canteen: true,
      boarding: false,
      emails: [
        { description: "orientamento", email: "s.patisso@domir.it" },
        { description: "istituto", email: "donmilani@pec.provincia.tn.it" },
        {
          description: "segreteria",
          email: "segr.donmilani@scuole.provincia.tn.it",
        },
        {
          description: "dirigenza",
          email: "dir.donmilani@scuole.provincia.tn.it",
        },
      ],
      phones: [
        { description: "telefono", number: "+39 0464 485511" },
        { description: "fax", number: "+39 0464 485550" },
      ],
      educational_paths: [
        {
          name: "Tecnico Economico Turistico",
          link: "https://domir.edu.it/indirizzo-di-studio/indirizzo-tecnico-economico-turismo/",
        },
        {
          name: "Professionale servizi per la sanità e l'assistenza sociale",
          link: "https://domir.edu.it/indirizzo-di-studio/indirizzo-professionale-servizi-per-la-sanita-e-lassistenza-sociale/",
        },
      ],
      events: [
        {
          title: "Open Day",
          description:
            "In presenza, con prenotazione sul sito della scuola nella sezione Servizi/Futuri studenti",
          start_date: new Date("2024-11-23T10:00:00+01:00"),
          end_date: new Date("2024-11-23T12:30:00+01:00"),
          location: "Via Balista, 6 - Rovereto",
          is_online: false,
          miur_code: "TNIS009009",
        },
        {
          title: "Open Day",
          description:
            "In presenza, con prenotazione sul sito della scuola nella sezione Servizi/Futuri studenti",
          start_date: new Date("2024-12-05T18:00:00+01:00"),
          end_date: new Date("2024-12-05T20:00:00+01:00"),
          location: "Via Balista, 6 - Rovereto",
          is_online: false,
          miur_code: "TNIS009009",
        },
      ],
    },

    // Liceo Filzi
    {
      name: "Liceo delle Scienze Umane 'F. Filzi'",
      miur_code: "TNPM02000E",
      type: typeIdMap["liceo"],
      website_url: "https://www.liceofilzi.it",
      description: "Liceo con indirizzo scienze umane ed economico sociale",
      address: "Corso Rosmini, 61 - 38068 ROVERETO",
      geo_location: { lat: 45.891207, lng: 11.038272 },
      responsabile_orientamento: "Marta Manica",
      main_campus: true,
      canteen: false,
      boarding: false,
      emails: [
        { description: "orientamento", email: "orientafilzi@liceofilzi.it" },
        { description: "istituto", email: "filzi@pec.provincia.tn.it" },
        {
          description: "segreteria",
          email: "segr.isup.filzi@scuole.provincia.tn.it",
        },
        {
          description: "dirigenza",
          email: "dir.isup.filzi@scuole.provincia.tn.it",
        },
      ],
      phones: [
        { description: "telefono", number: "+39 0464 421223" },
        { description: "fax", number: "+39 0464 433003" },
      ],
      educational_paths: [
        {
          name: "Liceo Economico Sociale",
          link: "https://www.liceofilzi.it/indirizzo-di-studio/liceo-economico-sociale/",
        },
        {
          name: "Liceo delle Scienze Umane",
          link: "https://www.liceofilzi.it/indirizzo-di-studio/liceo-delle-scienze-umane/",
        },
      ],
      events: [
        {
          title: "Open Day",
          description:
            'Presentazione della scuola a studenti e genitori e attività "Fra di noi..", in presenza. Prenotazioni sul sito della scuola sezione Orientamento in entrata.',
          start_date: new Date("2024-11-15T18:00:00+01:00"),
          end_date: new Date("2024-11-15T20:30:00+01:00"),
          location: "Corso Rosmini, 61 - Rovereto",
          is_online: false,
          miur_code: "TNPM02000E",
        },
        {
          title: "Pomeriggio al Filzi",
          description:
            "Attività e laboratori per soli studenti, in presenza. Prenotazioni sul sito della scuola sezione Orientamento in entrata",
          start_date: new Date("2024-11-21T14:30:00+01:00"),
          end_date: new Date("2024-11-21T17:00:00+01:00"),
          location: "Corso Rosmini, 61 - Rovereto",
          is_online: false,
          miur_code: "TNPM02000E",
        },
      ],
    },

    // ITET Fontana
    {
      name: "ITET Fontana",
      miur_code: "TNTD020009",
      type: typeIdMap["istituto tecnico"],
      website_url: "https://www.fgfontana.eu",
      description:
        "Istituto Tecnico Economico e Tecnologico con vari indirizzi",
      address: "Via Del Teatro, 4 - 38068 ROVERETO",
      geo_location: { lat: 45.893601249611514, lng: 11.042651600484701 },
      responsabile_orientamento: "",
      main_campus: true,
      canteen: false,
      boarding: false,
      emails: [
        { description: "orientamento", email: "orientamento@fontana.edu.it" },
        { description: "istituto", email: "fontana@pec.provincia.tn.it" },
        {
          description: "segreteria",
          email: "segr.fontana@scuole.provincia.tn.it",
        },
        {
          description: "dirigenza",
          email: "dir.fontana@scuole.provincia.tn.it",
        },
      ],
      phones: [
        { description: "telefono", number: "+39 0464 436100" },
        { description: "fax", number: "+39 0464 434116" },
      ],
      educational_paths: [
        {
          name: "Indirizzo Tecnologico Costruzioni, Ambiente e Territorio",
          link: "https://fgfontana.eu/indirizzo-di-studio/costruzioni-ambiente-e-territorio/",
        },
        {
          name: "Indirizzo Tencologico Chimica, Materiali e Biotecnologie - articolazione Biotecnologie Ambientali",
          link: "https://fgfontana.eu/indirizzo-di-studio/chimica-materiali-e-biotecnologie-articolazione-biotecnologie-ambientali/",
        },
        {
          name: "Indirizzo Tecnologico Tecnologie del Legno nelle Costruzioni",
          link: "https://fgfontana.eu/indirizzo-di-studio/tecnologie-del-legno-nelle-costruzioni/",
        },
        {
          name: "Indirizzo Economico Relazioni Internazionali per il Marketing",
          link: "https://fgfontana.eu/indirizzo-di-studio/indirizzo-relazioni-internazionali-per-il-marketing/",
        },
        {
          name: "Indirizzo Economico Sistemi Informativi Aziendali",
          link: "https://fgfontana.eu/indirizzo-di-studio/indirizzo-sistemi-informativi-aziendali/",
        },
      ],
      events: [
        {
          title: "Open Day",
          description:
            "Presentazione in presenza dell'offerta formativa e degli indirizzi di studio con prenotazione sul sito della scuola",
          start_date: new Date("2024-11-20T19:00:00+01:00"),
          end_date: new Date("2024-11-20T21:00:00+01:00"),
          location: "Via Del Teatro, 4 - Rovereto",
          is_online: false,
          miur_code: "TNTD020009",
        },
        {
          title: "Open Day",
          description:
            "Presentazione in presenza dell'offerta formativa e degli indirizzi di studio con prenotazione sul sito della scuola",
          start_date: new Date("2024-12-14T09:30:00+01:00"),
          end_date: new Date("2024-12-14T11:30:00+01:00"),
          location: "Via Del Teatro, 4 - Rovereto",
          is_online: false,
          miur_code: "TNTD020009",
        },
      ],
    },

    // ITT Marconi
    {
      name: "Istituto Tecnico Tecnologico 'G. Marconi'",
      miur_code: "TNTF02000G",
      type: typeIdMap["istituto tecnico"],
      website_url: "https://www.marconirovereto.it",
      description:
        "Istituto tecnico con focus su tecnologia, informatica e automazione",
      address: "Via Monti, 1 - 38068 Rovereto",
      geo_location: { lat: 45.911303, lng: 11.041517 },
      responsabile_orientamento: "Eugenio Berti, Luca Boschi",
      main_campus: true,
      canteen: true,
      boarding: false,
      emails: [
        {
          description: "orientamento",
          email: "orientamento@marconirovereto.it",
        },
        { description: "istituto", email: "marconi@pec.provincia.tn.it" },
        {
          description: "segreteria",
          email: "segr.itimarconi@scuole.provincia.tn.it",
        },
        { description: "dirigenza", email: "dirigente@marconirovereto.it" },
      ],
      phones: [
        { description: "telefono", number: "+39 0464 411400" },
        { description: "fax", number: "+39 0464 419130" },
      ],
      educational_paths: [
        {
          name: "Meccatronica ed Energia",
          link: "https://www.marconirovereto.it/indirizzo-di-studio/meccatronica/",
        },
        {
          name: "Automazione e Robotica Industriale",
          link: "https://www.marconirovereto.it/indirizzo-di-studio/elettronica-automazione/",
        },
        {
          name: "Informatica",
          link: "https://www.marconirovereto.it/indirizzo-di-studio/informatica/",
        },
      ],
      events: [
        {
          title: "Open Day",
          description:
            "Presentazione in presenza e in diretta streaming corso tradizionale e quadriennale",
          start_date: new Date("2024-11-15T17:30:00+01:00"),
          end_date: new Date("2024-11-15T19:30:00+01:00"),
          location: "Via Monti, 1 - Rovereto",
          is_online: false,
          miur_code: "TNTF02000G",
        },
        {
          title: "Open Day",
          description:
            "Presentazione in presenza e in diretta streaming corso tradizionale e quadriennale",
          start_date: new Date("2024-12-07T15:00:00+01:00"),
          end_date: new Date("2024-12-07T17:00:00+01:00"),
          location: "Via Monti, 1 - Rovereto",
          is_online: false,
          miur_code: "TNTF02000G",
        },
      ],
    },

    // Liceo Rosmini
    {
      name: "Liceo Antonio Rosmini",
      miur_code: "TNPC02000A",
      type: typeIdMap["liceo"],
      website_url: "https://www.liceorosmini.eu",
      description:
        "Liceo con vari indirizzi tra cui classico, scientifico, linguistico e sportivo",
      address: "Corso Bettini, 86 - 38068 ROVERETO",
      geo_location: { lat: 45.89606734364496, lng: 11.042964249413174 },
      responsabile_orientamento: "Biancamaria Toldo",
      main_campus: true,
      canteen: true,
      boarding: false,
      emails: [
        { description: "orientamento", email: "orientamento@liceorosmini.eu" },
        {
          description: "istituto",
          email: "rosmini.rovereto@pec.provincia.tn.it",
        },
        {
          description: "segreteria",
          email: "segr.liceorosmini@scuole.provincia.tn.it",
        },
        {
          description: "dirigenza",
          email: "dir.liceorosmini@scuole.provincia.tn.it",
        },
      ],
      phones: [
        { description: "telefono", number: "+39 0464 437700" },
        { description: "fax", number: "+39 0464 420025" },
      ],
      educational_paths: [
        {
          name: "Liceo classico",
          link: "https://liceorosmini.eu/indirizzo-di-studio/liceo-classico/",
        },
        {
          name: "Liceo linguistico",
          link: "https://liceorosmini.eu/indirizzo-di-studio/liceo-linguistico/",
        },
        {
          name: "Liceo scientifico tradizionale",
          link: "https://liceorosmini.eu/indirizzo-di-studio/liceo-scientifico/",
        },
        {
          name: "Liceo scientifico delle scienze applicate",
          link: "https://liceorosmini.eu/indirizzo-di-studio/liceo-scientifico-scienze-applicate/",
        },
        {
          name: "Liceo scientifico sportivo",
          link: "https://liceorosmini.eu/indirizzo-di-studio/liceo-scientifico-sportivo/",
        },
      ],
      events: [
        {
          title: "Open Day",
          description:
            "Presentazione indirizzi, visita alla scuola in presenza p/o Liceo Rosmini",
          start_date: new Date("2024-11-16T14:30:00+01:00"),
          end_date: new Date("2024-11-16T17:30:00+01:00"),
          location: "Corso Bettini, 86 - Rovereto",
          is_online: false,
          miur_code: "TNPC02000A",
        },
        {
          title: "Una serata al Liceo Rosmini",
          description:
            "Per studenti e genitori in presenza presso Liceo Rosmini (a breve programma sul sito)",
          start_date: new Date("2024-11-29T20:00:00+01:00"),
          end_date: new Date("2024-11-29T22:00:00+01:00"),
          location: "Corso Bettini, 86 - Rovereto",
          is_online: false,
          miur_code: "TNPC02000A",
        },
      ],
    },

    // UPT Scuola delle Professioni per il Terziario
    {
      name: "C.F.P. U.P.T. - Scuola delle Professioni per il Terziario",
      miur_code: "TNFP000001",
      type: typeIdMap["scuola professionale"],
      website_url: "https://www.cfpupt.it/sede-di-rovereto",
      description:
        "Centro di formazione professionale per il settore terziario",
      address: "Via Pasqui, 10 - 38068 ROVERETO",
      geo_location: { lat: 45.89826946898197, lng: 11.037105815828692 },
      responsabile_orientamento: "Elena Mondini",
      main_campus: true,
      canteen: false,
      boarding: false,
      emails: [
        { description: "orientamento", email: "elena.mondini@cfp-upt.it" },
        { description: "istituto", email: "cfp-upt@pec.it" },
        { description: "segreteria", email: "segreteria.rovereto@cfp-upt.it" },
      ],
      phones: [{ description: "telefono", number: "+39 0464 630050" }],
      educational_paths: [
        {
          name: "Operatore ai servizi d'impresa",
          link: "https://www.cfpupt.it/orientamentorovereto",
        },
        {
          name: "Operatore ai servizi di vendita",
          link: "https://www.cfpupt.it/orientamentorovereto",
        },
      ],
      events: [
        {
          title: "Open Day",
          description: "Open day e laboratori esperienziali, in presenza",
          start_date: new Date("2024-12-07T09:30:00+01:00"),
          end_date: new Date("2024-12-07T12:30:00+01:00"),
          location: "Via Pasqui, 10 - Rovereto",
          is_online: false,
          miur_code: "TNFP000001",
        },
        {
          title: "Open Day",
          description: "Open day e laboratori esperienziali, in presenza",
          start_date: new Date("2025-01-18T09:30:00+01:00"),
          end_date: new Date("2025-01-18T12:30:00+01:00"),
          location: "Via Pasqui, 10 - Rovereto",
          is_online: false,
          miur_code: "TNFP000001",
        },
      ],
    },

    // Polo Giuseppe Veronesi CFP
    {
      name: "Polo Giuseppe Veronesi CFP",
      miur_code: "TNCF002001",
      type: typeIdMap["scuola professionale"],
      website_url: "https://www.poloveronesi.it",
      description:
        "Centro di formazione professionale con focus su meccanica, elettronica e automazione",
      address: "Piazzale Orsi, 1 - ROVERETO",
      geo_location: { lat: 45.891789, lng: 11.035101 },
      responsabile_orientamento: "Claudio Porcelluzzi",
      main_campus: true,
      canteen: false,
      boarding: false,
      emails: [
        { description: "orientamento", email: "orientamento@poloveronesi.it" },
        { description: "istituto", email: "iscrizioni.veronesi@pec.it" },
        { description: "segreteria", email: "segreteria.dir@cfpgveronesi.it" },
      ],
      phones: [
        { description: "telefono", number: "+39 0464 433484" },
        { description: "fax", number: "+39 0464 436873" },
      ],
      educational_paths: [
        {
          name: "Operatore meccatronico",
          link: "https://drive.google.com/drive/folders/1dBPRveDcBrhPwmq0wI3i4c8Wx4t0G1bV",
        },
        {
          name: "Operatore meccanico",
          link: "https://drive.google.com/drive/folders/1k5C33yld6w3-tsfgThVbHXGZBXfsvFbT",
        },
        {
          name: "Operatore elettrico",
          link: "https://drive.google.com/drive/folders/1tOElINcSHWQ9TW47ayGOh9GZAxGZMSga",
        },
        {
          name: "Operatore della carpenteria metallica",
          link: "https://drive.google.com/drive/folders/1VeSq5KgofiArVBGRSJGbMlmpDirwT0CK",
        },
      ],
      events: [
        {
          title: "Open Day",
          description:
            "Presentazione indirizzi, visita alla scuola, in presenza",
          start_date: new Date("2024-11-22T18:00:00+01:00"),
          end_date: new Date("2024-11-22T20:00:00+01:00"),
          location: "Piazzale Orsi, 1 - Rovereto",
          is_online: false,
          miur_code: "TNCF002001",
        },
        {
          title: "Open Day",
          description:
            "Presentazione indirizzi, visita alla scuola, in presenza",
          start_date: new Date("2024-12-14T15:00:00+01:00"),
          end_date: new Date("2024-12-14T18:00:00+01:00"),
          location: "Piazzale Orsi, 1 - Rovereto",
          is_online: false,
          miur_code: "TNCF002001",
        },
      ],
    },

    // MADE++
    {
      name: "MADE++",
      miur_code: "TNCF002001-B",
      type: typeIdMap["scuola professionale"],
      website_url: "https://www.poloveronesi.it",
      description: "Scuola di Modellazione e Fabbricazione Digitale",
      address: "Via Fortunato Zeni, 8 - 38068 ROVERETO",
      geo_location: { lat: 45.891255, lng: 11.02986 },
      responsabile_orientamento: "Claudio Porcelluzzi",
      main_campus: false,
      parent_school: "TNCF002001", // Reference to Polo Giuseppe Veronesi
      canteen: false,
      boarding: false,
      emails: [
        { description: "orientamento", email: "orientamento@poloveronesi.it" },
        { description: "istituto", email: "iscrizioni.veronesi@pec.it" },
        { description: "segreteria", email: "segreteria.dir@cfpgveronesi.it" },
      ],
      phones: [
        { description: "telefono", number: "+39 0464 433484" },
        { description: "fax", number: "+39 0464 436873" },
      ],
      educational_paths: [
        {
          name: "Tecnico della Modellazione e Fabbricazione Digitale",
          link: "https://drive.google.com/file/d/1PwTigZmUfiGbYs7RGkbB0_tb1wVw4aPB",
        },
      ],
      events: [
        {
          title: "Open Day",
          description:
            "Presentazione indirizzi, visita alla scuola, in presenza",
          start_date: new Date("2024-11-23T15:00:00+01:00"),
          end_date: new Date("2024-11-23T18:00:00+01:00"),
          location: "Via Fortunato Zeni, 8 - Rovereto",
          is_online: false,
          miur_code: "TNCF002001-B",
        },
        {
          title: "Open Day",
          description:
            "Presentazione indirizzi, visita alla scuola, in presenza",
          start_date: new Date("2024-12-14T15:00:00+01:00"),
          end_date: new Date("2024-12-14T18:00:00+01:00"),
          location: "Via Fortunato Zeni, 8 - Rovereto",
          is_online: false,
          miur_code: "TNCF002001-B",
        },
      ],
    },

    // Liceo Steam International
    {
      name: "Liceo Steam International",
      miur_code: "TNPSID500S",
      type: typeIdMap["liceo"],
      website_url: "https://www.steaminternational.eu/",
      description:
        "Liceo scientifico internazionale con focus su scienze applicate e tecnologia",
      address: "Via Madonna del Monte, 6 - ROVERETO",
      geo_location: { lat: 45.881998, lng: 11.044591 },
      responsabile_orientamento: "Elena Trainotti",
      main_campus: true,
      canteen: true,
      boarding: false,
      emails: [
        { description: "orientamento", email: "info@liceosteam.it" },
        { description: "istituto", email: "iscrizioni.veronesi@pec.it" },
        { description: "segreteria", email: "segreteria.dir@cfpgveronesi.it" },
      ],
      phones: [{ description: "telefono", number: "+39 0464 433484" }],
      educational_paths: [
        {
          name: "Liceo Scientifico - scienze applicate",
          link: "https://drive.google.com/drive/folders/1Td292FMJcxNk1qC9SojDZky2AB4sfkBc",
        },
      ],
      events: [
        {
          title: "Open Day",
          description: "Presso lo STEAM Campus, via Madonna del Monte 6",
          start_date: new Date("2024-11-08T18:00:00+01:00"),
          end_date: new Date("2024-11-08T20:00:00+01:00"),
          location: "Via Madonna del Monte, 6 - Rovereto",
          is_online: false,
          miur_code: "TNPSID500S",
        },
        {
          title: "Open Day",
          description: "Presso lo STEAM Campus, via Madonna del Monte 6",
          start_date: new Date("2024-11-23T14:30:00+01:00"),
          end_date: new Date("2024-11-23T17:30:00+01:00"),
          location: "Via Madonna del Monte, 6 - Rovereto",
          is_online: false,
          miur_code: "TNPSID500S",
        },
      ],
    },
  ];

  // Transaction to ensure atomicity of operations
  await knex.transaction(async (trx) => {
    // Insert schools
    for (const schoolData of schoolsData) {
      const { emails, phones, educational_paths, events, ...schoolMainData } =
        schoolData;
      if (schoolMainData.parent_school) {
        const [parentSchool] = await trx("schools")
          .select("id")
          .where("miur_code", schoolMainData.parent_school)
          .limit(1);

        if (parentSchool) {
          schoolMainData.parent_school = parentSchool.id;
        } else {
          // Handle the case where parent school isn't found
          schoolMainData.parent_school = null;
        }
      }

      // Insert or update the school
      const [schoolId] = await trx("schools")
        .insert({
          name: schoolMainData.name,
          miur_code: schoolMainData.miur_code,
          type: schoolMainData.type,
          website_url: schoolMainData.website_url,
          description: schoolMainData.description,
          address: schoolMainData.address,
          geo_location: JSON.stringify(schoolMainData.geo_location),
          responsabile_orientamento: schoolMainData.responsabile_orientamento,
          main_campus: schoolMainData.main_campus,
          canteen: schoolMainData.canteen,
          boarding: schoolMainData.boarding,
          parent_school: schoolMainData.parent_school, // This will now be the UUID
        })
        .onConflict("miur_code")
        .merge()
        .returning("id");

      // Insert emails
      if (emails && emails.length > 0) {
        await trx("school_emails").where({ school_id: schoolId }).delete();

        for (const email of emails) {
          await trx("school_emails").insert({
            school_id: schoolId,
            description: email.description,
            email: email.email,
          });
        }
      }

      // Insert phones
      if (phones && phones.length > 0) {
        await trx("school_phones").where({ school_id: schoolId }).delete();

        for (const phone of phones) {
          await trx("school_phones").insert({
            school_id: schoolId,
            description: phone.description,
            number: phone.number,
          });
        }
      }

      // Process educational paths
      if (educational_paths && educational_paths.length > 0) {
        for (const path of educational_paths) {
          // Try to find a matching educational path
          let pathId = findEducationalPathId(path.name);

          // If no matching path found, create a new one
          if (!pathId) {
            const [newPathId] = await trx("educational_paths")
              .insert({
                name: path.name,
                description: `Path for ${schoolMainData.name}`,
              })
              .returning("id");

            pathId = newPathId;
          }

          // Create the link between school and path with URL
          await trx("school_educational_path_links")
            .insert({
              school_id: schoolId,
              educational_path_id: pathId,
              link_url: path.link,
            })
            .onConflict(["school_id", "educational_path_id"])
            .merge();

          // Also create the many-to-many relationship in the junction table
          await trx("schools_educational_paths")
            .insert({
              schools_id: schoolId,
              educational_paths_id: pathId,
            })
            .onConflict(["schools_id", "educational_paths_id"])
            .ignore();
        }
      }

      // Insert events
      if (events && events.length > 0) {
        for (const event of events) {
          await trx("events").insert({
            title: event.title,
            description: event.description,
            start_date: event.start_date,
            end_date: event.end_date,
            location: event.location,
            is_online: event.is_online,
            online_link: event.online_link || null,
            miur_code: event.miur_code,
          });
        }
      }
    }
  });

  console.log("✅ Seed completed successfully");
}
