# Lokale Entwicklung & Deployment-Anleitung

Dieses Dokument beschreibt, wie du das Projekt lokal entwickelst, testest, Prisma-Migrationen durchführst und es anschließend auf einen Ubuntu-Server deployst.

---

## 🔧 Lokale Einrichtung

1. **.env-Datei vorbereiten**
   Kopiere die Umgebungsdatei für die lokale Entwicklung:
   ```bash
   cp .env.dev .env
   ```
2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```
3. **Entwicklungsumgebung starten**
   ```bash
   npm run dev
   ```

---

## 🧪 Tests ausführen

```bash
npm run test
```

Die Tests verwenden standardmäßig die** **`.env.test`-Konfiguration.

---

## 🗄️ Prisma & Datenbank

### Datenbank-Migration (lokal)

```bash
npm run migrate
```

### Datenbank-Migration für Testumgebung

```bash
npm run migrate:test
```

Die Testdatenbank ist z.B.:

```
postgresql://htw:htw@localhost:5432/EAM-TEST
```

---

## 🚀 Deployment auf Ubuntu-Server

### Voraussetzungen

* SSH-Zugang zum Server
* Node.js, npm und PostgreSQL auf dem Server installiert
* Projektverzeichnis:** **`/var/www/html/chatbot`

### Schritt-für-Schritt

1. **Lokal Projekt bauen**
   ```bash
   npm run build
   ```
2. **Build auf den Server kopieren**
   ```bash
   scp -r .next/ public/ root@212.227.76.128:/var/www/html/chatbot/
   ```
3. **Server-seitig ausführen**
   ```bash
   pm2 stop chatbot || true
   pm2 start npm --name chatbot -- start
   ```

---

## 📁 Weitere Hinweise

* Für persistente Prisma-Generierung auf dem Server ggf. lokal vorab ausführen:
  ```bash
  npx prisma generate
  ```
* Sollte der Speicher auf dem Server zu gering sein, kann der Build auch lokal erfolgen und dann übertragen werden.

---

 **Hinweis** : Dieses Projekt verwendet Next.js 15 mit Turbopack im Entwicklungsmodus und speichert Test- und Produktionsdatenbanken getrennt.
