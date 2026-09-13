import React from 'react';
import { FaUsers, FaBook, FaBolt, FaChartLine, FaGamepad, FaClock, FaTrophy, FaBrain, FaRocket, FaHeart } from 'react-icons/fa';

// Update this to match your main app's ViewType
type ViewType = 'menu' | 'dashboard' | 'host' | 'hostGame' | 'join' | 'playerGame' | 'solo' | 'soloGame';

interface MainPageProps {
  onShowAuth: () => void;
  user: any;
  onNavigate: (view: ViewType) => void;
}

export default function MainPage({ onShowAuth, user, onNavigate }: MainPageProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0F4F8' }}>
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full border mb-8">
            <FaRocket style={{ color: '#568EA6' }} />
            <span className="font-semibold" style={{ color: '#305F72' }}>Tương lai của việc học tương tác</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6" style={{ color: '#305F72' }}>
            Student <span style={{ color: '#568EA6' }}>Study</span>
          </h1>

          <p className="text-xl sm:text-2xl mb-4 max-w-3xl mx-auto" style={{ color: '#305F72' }}>
            Nơi sự hào hứng của trò chơi nhiều người trực tiếp như <span className="font-semibold" style={{ color: '#568EA6' }}>Kahoot</span> kết hợp cùng sức mạnh học tập của <span className="font-semibold" style={{ color: '#F18C8E' }}>Quizlet</span>
          </p>

          <p className="text-lg mb-12 max-w-2xl mx-auto" style={{ color: '#305F72', opacity: 0.8 }}>
            Tạo Quiz bằng AI, tổ chức thi trực tiếp và làm chủ mọi môn học với nền tảng học tập kết hợp của chúng tôi
          </p>

          {!user ? (
            <button
              onClick={onShowAuth}
              className="text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#568EA6' }}
            >
              Bắt đầu miễn phí
            </button>
          ) : (
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#568EA6' }}
            >
              Đến Dashboard
            </button>
          )}
        </div>

        {/* Platform Comparison */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-8 rounded-2xl border text-center shadow-lg">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F0B7A4' }}>
              <FaGamepad className="text-2xl" style={{ color: '#305F72' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#305F72' }}>Như Kahoot</h3>
            <p className="mb-4" style={{ color: '#305F72', opacity: 0.8 }}>Trò chơi nhiều người trực tiếp với thi đấu thời gian thực và bảng xếp hạng</p>
            <div className="flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: '#568EA6' }}>
              <FaBolt />
              <span>Hào hứng theo thời gian thực</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border text-center shadow-lg">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F18C8E' }}>
              <FaHeart className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#305F72' }}>Student Study</h3>
            <p className="mb-4" style={{ color: '#305F72', opacity: 0.8 }}>Kết hợp ưu điểm của cả hai với khả năng tạo Quiz bằng AI</p>
            <div className="flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: '#F18C8E' }}>
              <FaRocket />
              <span>Kết hợp hoàn hảo</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border text-center shadow-lg">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F0B7A4' }}>
              <FaBook className="text-2xl" style={{ color: '#305F72' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#305F72' }}>Như Quizlet</h3>
            <p className="mb-4" style={{ color: '#305F72', opacity: 0.8 }}>Chế độ học cá nhân với theo dõi tiến độ và ôn tập ngắt quãng</p>
            <div className="flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: '#568EA6' }}>
              <FaBrain />
              <span>Học chuyên sâu</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#305F72' }}>Tính năng mạnh mẽ cho mọi phong cách học</h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#305F72', opacity: 0.8 }}>
              Dù bạn tổ chức cuộc thi trong lớp hay tự học, Student Study luôn thích ứng với nhu cầu của bạn
            </p>
          </div>

          <div className="feature-grid">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F18C8E' }}>
                <FaBolt className="text-xl text-white" />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Tạo Quiz bằng AI</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Tạo Quiz chuyên nghiệp tức thì từ mọi chủ đề với sự hỗ trợ của AI</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#568EA6' }}>
                <FaUsers className="text-xl text-white" />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Nhiều người trực tiếp</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Tổ chức cuộc thi Quiz thời gian thực với tối đa 100 người chơi cùng lúc</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F0B7A4' }}>
                <FaBook className="text-xl" style={{ color: '#305F72' }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Chế độ tự học</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Luyện tập riêng với phản hồi cá nhân hóa và phương pháp học thích ứng</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F18C8E' }}>
                <FaChartLine className="text-xl text-white" />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Phân tích tiến độ</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Theo dõi tiến độ học tập với thông tin chi tiết và chỉ số hiệu quả</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#568EA6' }}>
                <FaClock className="text-xl text-white" />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Thử thách tính giờ</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Giới hạn thời gian tùy chỉnh tăng thêm áp lực và hứng thú học tập</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F0B7A4' }}>
                <FaTrophy className="text-xl" style={{ color: '#305F72' }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Bảng xếp hạng trực tiếp</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Xếp hạng và thành tích theo thời gian thực tạo động lực thi đua lành mạnh</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F18C8E' }}>
                <FaGamepad className="text-xl text-white" />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Phản hồi tức thì</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>Nhận kết quả và giải thích ngay để củng cố việc học</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#568EA6' }}>
                <FaBrain className="text-xl text-white" />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#305F72' }}>Thích ứng thông minh</h3>
              <p className="text-sm" style={{ color: '#305F72', opacity: 0.8 }}>AI điều chỉnh độ khó dựa trên kết quả để tối ưu việc học</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-8" style={{ backgroundColor: '#F0B7A4' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#305F72' }}>Student Study hoạt động như thế nào</h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#305F72', opacity: 0.8 }}>
              Từ tạo Quiz đến thi đấu qua ba bước đơn giản
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl" style={{ backgroundColor: '#568EA6' }}>
                1
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#305F72' }}>Tạo bằng AI</h3>
              <p className="mb-4" style={{ color: '#305F72', opacity: 0.8 }}>
                Chỉ cần mô tả chủ đề cho AI, bạn sẽ có một Quiz chuyên nghiệp trong vài giây. Hoặc dùng trình chỉnh sửa thủ công để toàn quyền kiểm soát.
              </p>
              <div className="p-4 rounded-xl bg-white border">
                <p className="text-sm font-mono" style={{ color: '#568EA6' }}>
                  "Tạo Quiz 15 câu hỏi về Thế chiến II cho học sinh trung học"
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl" style={{ backgroundColor: '#F18C8E' }}>
                2
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#305F72' }}>Chọn chế độ</h3>
              <p className="mb-4" style={{ color: '#305F72', opacity: 0.8 }}>
                Tổ chức trò chơi nhiều người trực tiếp hoặc tự học theo tốc độ riêng với phản hồi cá nhân hóa.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl text-center bg-white border" style={{ borderColor: '#568EA6' }}>
                  <FaUsers className="mx-auto mb-2" style={{ color: '#568EA6' }} />
                  <p className="text-xs font-semibold" style={{ color: '#305F72' }}>Tổ chức trò chơi</p>
                </div>
                <div className="p-3 rounded-xl text-center bg-white border" style={{ borderColor: '#F18C8E' }}>
                  <FaBook className="mx-auto mb-2" style={{ color: '#F18C8E' }} />
                  <p className="text-xs font-semibold" style={{ color: '#305F72' }}>Tự học</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl" style={{ backgroundColor: '#305F72' }}>
                3
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#305F72' }}>Học và thi đấu</h3>
              <p className="mb-4" style={{ color: '#305F72', opacity: 0.8 }}>
                Trả lời câu hỏi thời gian thực, xem kết quả trực tiếp và theo dõi tiến độ theo thời gian.
              </p>
              <div className="p-4 rounded-xl bg-white border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold" style={{ color: '#305F72' }}>Xếp hạng: #1</span>
                  <span className="text-sm font-bold" style={{ color: '#568EA6' }}>850 pts</span>
                </div>
                <div className="rounded-full h-2" style={{ backgroundColor: '#F0B7A4' }}>
                  <div className="h-2 rounded-full w-4/5" style={{ backgroundColor: '#F18C8E' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-8 text-white" style={{ backgroundColor: '#568EA6' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Sẵn sàng thay đổi trải nghiệm học tập?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ opacity: 0.9 }}>
            Tham gia cùng hàng nghìn giáo viên và học sinh đang làm cho việc học trở nên thú vị hơn với Student Study
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <button
                  onClick={onShowAuth}
                  className="px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#F18C8E', color: '#305F72' }}
                >
                  Bắt đầu tạo Quiz
                </button>
                <button
                  onClick={() => onNavigate('join')}
                  className="text-white border px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
                  style={{ borderColor: '#F0B7A4', backgroundColor: '#305F72' }}
                >
                  Tham gia trò chơi
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#F18C8E', color: '#305F72' }}
              >
                Đến Dashboard của bạn
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-8 text-white" style={{ backgroundColor: '#305F72' }}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">
              Student <span style={{ color: '#F18C8E' }}>Study</span>
            </h3>
            <p style={{ color: '#F0B7A4' }}>Nơi việc học gặp gỡ sự hào hứng</p>
          </div>

          <div className="border-t pt-8" style={{ borderColor: '#568EA6' }}>
            <p style={{ color: '#F0B7A4' }}>
              &copy; 2026 Student Study - PLT Solutions "học kỹ năng nghề CNTT từ doanh nghiệp".
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}