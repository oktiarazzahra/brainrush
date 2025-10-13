// src/pages/HelpPage.jsx
import DashboardLayout from '../components/DashboardLayout'

const HelpPage = () => {
  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-8 pt-8">
          <h1 className="text-3xl font-bold text-yellow-300 drop-shadow-lg">Bantuan</h1>
        </div>
        
        <main className="flex-1 bg-blue-900 mx-8 rounded-tl-lg p-8 mb-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Pusat Bantuan Brain Rush</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-bold text-lg text-blue-600 mb-2">📝 Cara Membuat Quiz</h3>
                <p className="text-gray-600">
                  Klik tombol "Buat" di sidebar, lalu klik "Buat Kuis Baru". 
                  Isi judul quiz, tambahkan pertanyaan dan pilihan jawaban. 
                  Setelah selesai, simpan sebagai draft atau langsung publish.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-bold text-lg text-green-600 mb-2">🎮 Cara Join Quiz Live</h3>
                <p className="text-gray-600">
                  Masukkan PIN yang diberikan oleh host di halaman utama, 
                  lalu klik "JOIN". Tunggu hingga host memulai quiz, 
                  kemudian jawab pertanyaan yang muncul di layar.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-bold text-lg text-purple-600 mb-2">📊 Cara Melihat History</h3>
                <p className="text-gray-600">
                  Buka menu "History" di sidebar untuk melihat semua quiz 
                  yang sudah pernah dimainkan. Klik pada quiz untuk melihat 
                  detail hasil dan skor pemain.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-bold text-lg text-orange-600 mb-2">⏰ Cara Belajar Mandiri</h3>
                <p className="text-gray-600">
                  Buka menu "Belajar Mandiri" untuk mengerjakan quiz secara individu. 
                  Pilih quiz yang tersedia, kerjakan soal-soal, dan lihat skor kamu 
                  setelah selesai mengerjakan.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-bold text-lg text-red-600 mb-2">❓ Butuh Bantuan Lainnya?</h3>
                <p className="text-gray-600">
                  Jika masih ada pertanyaan, hubungi tim support Brain Rush 
                  melalui email: support@brainrush.com atau melalui 
                  WhatsApp: +62 812-3456-7890
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  )
}

export default HelpPage
