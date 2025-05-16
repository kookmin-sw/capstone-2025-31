const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 1234;

// cors 적용!
app.use(cors());

// 업로드, 로그 디렉토리 설정
const uploadDir = path.join(__dirname, 'upload_files');
const logDir = path.join(__dirname, 'logs');

// 디렉토리 없으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 정적 파일 제공
app.use('/upload_files', express.static(uploadDir));

// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    try {
      const safeName = Buffer.from(file.originalname, 'binary').toString('utf8');
      cb(null, safeName);
    } catch (err) {
      console.error('파일명 디코딩 실패:', err);
      cb(null, file.originalname);
    }
  }
});
const upload = multer({ storage });

// 파일 업로드
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '파일이 없습니다.' });
  }

  const originalName = req.file.originalname;
  const now = new Date();
  const formattedDate = now.toISOString();

  const baseName = path.parse(originalName).name;
  const logFilePath = path.join(logDir, `${baseName}_log.csv`);

  const logEntry = `${originalName},${formattedDate}\n`;

  // ✅ 파일이 없으면 BOM 먼저 쓰기
  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '\uFEFF', { encoding: 'utf8' }); 
  }

  // ✅ 로그 데이터 추가
  fs.appendFileSync(logFilePath, logEntry, { encoding: 'utf8' });

  console.log(`📥 업로드 완료: ${originalName} → 로그 저장: ${logFilePath}`);

  res.status(200).json({ message: '업로드 성공' });
});
// 파일 목록 가져오기
app.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir, { encoding: 'utf8' });
    res.json(files);
  } catch (err) {
    console.error('파일 목록 가져오기 실패:', err);
    res.status(500).json({ error: '파일 목록 가져오기 실패' });
  }
});

// 파일 삭제
app.delete('/delete', express.json(), (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ error: '파일 이름이 필요합니다.' });
  }

  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);

    // 삭제할 때 해당 로그 파일도 같이 삭제할지 결정 (옵션)
    const baseName = path.parse(filename).name;
    const logFilePath = path.join(logDir, `${baseName}_log.csv`);
    if (fs.existsSync(logFilePath)) {
      fs.unlinkSync(logFilePath);
      console.log(`🗑️ 로그 파일 삭제됨: ${logFilePath}`);
    }

    return res.json({ message: '파일 삭제 완료' });
  } else {
    return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
  }
});

// 서버 실행
app.listen(port, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});
