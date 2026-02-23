import dotenv from 'dotenv';
import connectDB from '../config/db';
import Blog from '../models/Blog';
import User from '../models/User';

dotenv.config();

const blogs = [
    {
        title: "Bí quyết nấu phở bò truyền thống",
        description: "Học cách hầm xương trong 12 tiếng để có nước dùng trong và ngọt thanh vị tự nhiên.",
        content: "Nấu phở bò không khó nhưng cần sự kiên nhẫn. Bước 1: Nướng gừng và hành tím... Bước 2: Luộc sơ xương bò... Bước 3: Hầm với quế, hồi, thảo quả...",
        image: "https://images.unsplash.com/photo-1582878826629-29b7adcdc43?q=80&w=1000&auto=format&fit=crop",
        category: "Cooking Guide",
        riskAlerts: ["Tránh dùng xương ôi thiu", "Không dùng quá nhiều quế hồi sẽ gây đắng"],
    },
    {
        title: "Cách chọn rau củ sạch VietGAP",
        description: "Mẹo phân biệt rau sạch tự nhiên và rau sử dụng quá nhiều thuốc bảo vệ thực vật.",
        content: "Rau sạch VietGAP thường không có vẻ ngoài quá mướt mát, lá có thể hơi rỗ nhưng đảm bảo an toàn... Hãy kiểm tra mã QR trên bao bì để truy xuất nguồn gốc.",
        image: "https://images.unsplash.com/photo-1566385270613-9f05626e3266?q=80&w=1000&auto=format&fit=crop",
        category: "Ingredient Screening",
        ingredientInfo: [
            { name: "Cải xanh", quality: "Good", warning: "Nên rửa kỹ để loại bỏ sâu nhỏ" },
            { name: "Cà chua", quality: "Good", warning: "Tránh quả quá chín nhũn" }
        ],
    },
    {
        title: "Cảnh báo ngộ độc thực phẩm mùa hè",
        description: "Các loại thực phẩm dễ gây ngộ độc và cách bảo quản đúng cách trong thời tiết nắng nóng.",
        content: "Mùa hè là thời điểm vi khuẩn phát triển mạnh nhất. Hải sản và đồ sống là những thực phẩm đứng đầu danh sách rủi ro... Cần bảo quản trong ngăn mát ở nhiệt độ dưới 5 độ C.",
        image: "https://images.unsplash.com/photo-1549704431-7e88944510b3?q=80&w=1000&auto=format&fit=crop",
        category: "Risk Warning",
        riskAlerts: ["Vi khuẩn Salmonella trong trứng sống", "Độc tố trong tiết canh", "Hải sản không tươi"],
    },
    {
        title: "5 bước sàng lọc thịt heo an toàn",
        description: "Đừng để bị lừa bởi màu sắc bắt mắt của thịt sử dụng chất tạo nạc.",
        content: "Thịt heo sạch có màu hồng tươi, mỡ trắng trong, ấn vào có độ đàn hồi... Thịt sử dụng chất tạo nạc thường có thớ thô, màu đỏ rực bất thường.",
        image: "https://images.unsplash.com/photo-1602491673980-73aa38de027a?q=80&w=1000&auto=format&fit=crop",
        category: "Ingredient Screening",
        riskAlerts: ["Thịt lợn gạo", "Thịt nhiễm dịch tả Châu Phi"],
    },
    {
        title: "Lợi ích của việc ăn thực phẩm theo mùa",
        description: "Tại sao bạn nên chọn rau củ quả đúng mùa thay vì thực phẩm trái mùa.",
        content: "Thực phẩm đúng mùa thường tươi ngon hơn, chứa nhiều dinh dưỡng hơn và ít thuốc bảo quản hơn...",
        image: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=1000&auto=format&fit=crop",
        category: "Risk Warning",
        riskAlerts: ["Thực phẩm trái mùa thường dùng nhiều chất bảo quản"],
    },
    {
        title: "Cách bảo quản thực phẩm trong tủ lạnh đúng cách",
        description: "Sắp xếp tủ lạnh thông minh để giữ thực phẩm tươi lâu và tránh nhiễm chéo vi khuẩn.",
        content: "Ngăn trên cùng dành cho đồ ăn sẵn, ngăn giữa cho thịt cá sống (trong hộp kín), ngăn dưới cùng cho rau củ...",
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop",
        category: "Cooking Guide",
        riskAlerts: ["Nhiễm chéo vi khuẩn giữa đồ sống và đồ chín"],
    },
    {
        title: "Phân biệt các loại trứng trên thị trường",
        description: "Trứng gà ta, trứng gà công nghiệp và trứng vịt: Đâu là lựa chọn tốt nhất?",
        content: "Trứng gà ta thường nhỏ hơn, vỏ dày, lòng đỏ to và thơm hơn... Trứng gà công nghiệp có kích thước lớn nhưng lòng đỏ nhạt màu hơn.",
        image: "https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?q=80&w=1000&auto=format&fit=crop",
        category: "Ingredient Screening",
        ingredientInfo: [
            { name: "Trứng gà", quality: "Good", warning: "Kiểm tra vỏ trứng không bị nứt" }
        ],
    },
    {
        title: "Tác hại của việc sử dụng dầu ăn chiên lại nhiều lần",
        description: "Những nguy cơ tiềm ẩn cho sức khỏe khi tái sử dụng dầu ăn quá mức.",
        content: "Dầu ăn chiên lại nhiều lần sinh ra các gốc tự do và chất gây ung thư... Hãy bỏ dầu khi thấy màu chuyển sang nâu đậm hoặc có mùi lạ.",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbadfacd?q=80&w=1000&auto=format&fit=crop",
        category: "Risk Warning",
        riskAlerts: ["Chất béo chuyển hóa (Trans fat)", "Nguy cơ ung thư"],
    }
];

const seedBlogs = async () => {
    try {
        await connectDB();

        const user = await User.findOne();
        if (!user) {
            console.log('Please seed users first');
            process.exit(1);
        }

        const blogData = blogs.map(blog => ({
            ...blog,
            author: user._id
        }));

        await Blog.deleteMany();
        await Blog.insertMany(blogData);

        console.log('Blogs Seeded!');
        process.exit();
    } catch (error) {
        console.error('Error seeding blogs:', error);
        process.exit(1);
    }
};

seedBlogs();
