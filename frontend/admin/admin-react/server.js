const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 1234;

// cors 적용!
app.use(cors());

app.use('/upload_files', express.static(path.join(__dirname, 'upload_files')));

// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'upload_files');
    if(!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 한글 깨짐 방지
    try{
      const safeName = Buffer.from(file.originalname, 'binary').toString('utf8');
      cb(null, safeName);
    } 
    // 실패하면 원본 저장
    catch(err){
      console.error('파일명 디코딩 실패:', err);
      cb(null, file.originalname); 
    }
  }
});
const upload = multer({ storage });

// 파일 업로드
app.post('/upload', upload.single('file'), (req, res) => {
  res.status(200).json({ message: '업로드 성공' });
});

// 파일 목록 가져오기
app.get('/files', (req, res) => {
  try{
    const dir = path.join(__dirname, 'upload_files');
    const files = fs.readdirSync(dir, { encoding: 'utf8' }); // utf8 인코딩으로 읽기
    res.json(files);
  } 
  catch (err){
    console.error('파일 목록 가져오기 실패:', err);
    res.status(500).json({ error: '파일 목록 가져오기 실패' });
  }
});

// 파일 삭제
app.delete('/delete', express.json(), (req, res) => {
  const{ filename } = req.body;
  if(!filename){
    return res.status(400).json({ error: '파일 이름이 필요합니다.' });
  }

  const filePath = path.join(__dirname, 'upload_files', filename);
  if(fs.existsSync(filePath)){
    fs.unlinkSync(filePath);
    return res.json({ message: '파일 삭제 완료' });
  } 
  else{
    return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
  }
});

app.listen(port, () => {
  console.log(`서버 실행 중: http://localhost:${port}`);
});
