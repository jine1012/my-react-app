import express from 'express';

const router = express.Router();

// 일기 작성 API
router.post('/entry', async (req, res) => {
  try {
    const { title, content, mood, activities, babyMood, date, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // 여기에 데이터베이스 저장 로직 추가
    // 현재는 메모리에서 처리
    
    const entry = {
      id: Date.now(),
      title,
      content,
      mood: mood || '보통',
      activities: activities || [],
      babyMood: babyMood || '보통',
      date: date || new Date().toISOString(),
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      entry,
      message: '일기가 저장되었습니다.'
    });

  } catch (error) {
    console.error('Diary entry error:', error);
    res.status(500).json({ 
      error: 'Failed to save diary entry',
      message: error.message 
    });
  }
});

// 일기 목록 조회 API
router.get('/entries', (req, res) => {
  try {
    const { page = 1, limit = 10, search, mood, dateFrom, dateTo } = req.query;
    
    // 여기에 데이터베이스에서 일기 목록 조회 로직 추가
    // 현재는 더미 데이터 반환
    
    const dummyEntries = [
      {
        id: 1,
        title: "오늘 아기가 처음으로 뒤집기를 했어요!",
        content: "아기가 처음으로 뒤집기를 성공했어요. 정말 기뻤습니다...",
        mood: "행복",
        activities: ["뒤집기 연습", "장난감 놀이"],
        babyMood: "활발",
        date: new Date().toISOString(),
        tags: ["첫발달", "뒤집기"],
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "이유식 시작했는데 잘 먹네요",
        content: "오늘 처음으로 이유식을 시작했는데 아기가 잘 먹어줘서 다행이에요...",
        mood: "만족",
        activities: ["이유식", "놀이"],
        babyMood: "좋음",
        date: new Date(Date.now() - 86400000).toISOString(),
        tags: ["이유식", "첫시도"],
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    // 검색 및 필터링 로직 (간단한 구현)
    let filteredEntries = dummyEntries;
    
    if (search) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.title.includes(search) || entry.content.includes(search)
      );
    }
    
    if (mood) {
      filteredEntries = filteredEntries.filter(entry => entry.mood === mood);
    }

    // 페이지네이션
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    res.json({
      success: true,
      entries: paginatedEntries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredEntries.length,
        totalPages: Math.ceil(filteredEntries.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Diary entries fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch diary entries',
      message: error.message 
    });
  }
});

// 특정 일기 조회 API
router.get('/entry/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 여기에 데이터베이스에서 특정 일기 조회 로직 추가
    // 현재는 더미 데이터 반환
    
    const dummyEntry = {
      id: parseInt(id),
      title: "오늘 아기가 처음으로 뒤집기를 했어요!",
      content: "아기가 처음으로 뒤집기를 성공했어요. 정말 기뻤습니다. 오랫동안 연습한 보람이 있었어요. 아기의 성장을 직접 보는 순간이 가장 행복한 것 같아요.",
      mood: "행복",
      activities: ["뒤집기 연습", "장난감 놀이", "엄마와 스킨십"],
      babyMood: "활발",
      date: new Date().toISOString(),
      tags: ["첫발달", "뒤집기", "성장"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      entry: dummyEntry
    });

  } catch (error) {
    console.error('Diary entry fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch diary entry',
      message: error.message 
    });
  }
});

// 일기 수정 API
router.put('/entry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, mood, activities, babyMood, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // 여기에 데이터베이스 수정 로직 추가
    
    const updatedEntry = {
      id: parseInt(id),
      title,
      content,
      mood: mood || '보통',
      activities: activities || [],
      babyMood: babyMood || '보통',
      tags: tags || [],
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      entry: updatedEntry,
      message: '일기가 수정되었습니다.'
    });

  } catch (error) {
    console.error('Diary entry update error:', error);
    res.status(500).json({ 
      error: 'Failed to update diary entry',
      message: error.message 
    });
  }
});

// 일기 삭제 API
router.delete('/entry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 여기에 데이터베이스 삭제 로직 추가
    
    res.json({
      success: true,
      message: '일기가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Diary entry delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete diary entry',
      message: error.message 
    });
  }
});

// 일기 통계 API
router.get('/stats', (req, res) => {
  try {
    // 여기에 데이터베이스에서 통계 데이터 조회 로직 추가
    // 현재는 더미 데이터 반환
    
    const stats = {
      totalEntries: 25,
      monthlyEntries: [5, 8, 12],
      moodDistribution: {
        "행복": 10,
        "만족": 8,
        "보통": 5,
        "걱정": 2
      },
      topTags: ["첫발달", "이유식", "놀이", "수면"],
      averageEntriesPerWeek: 3.5
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Diary stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch diary stats',
      message: error.message 
    });
  }
});

export default router;
