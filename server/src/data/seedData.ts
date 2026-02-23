import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Banner from '../models/Banner';
import Recipe from '../models/Recipe';
import Shop from '../models/Shop';

// Load env vars
dotenv.config();

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);

        await Recipe.deleteMany();
        await Banner.deleteMany();
        await Shop.deleteMany();

        // 1. Create Shops
        const shops = await Shop.create([
            {
                name: 'Fresh Garden Quản Lộ',
                image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
                address: '123 Quản Lộ, Quận 1, TP.HCM',
                location: { type: 'Point', coordinates: [106.7019, 10.7765] },
                rating: 4.8,
                isVerified: true,
                isFeatured: true,
                discountLabel: 'Giảm 14k',
                categories: ['Rau củ', 'Trái cây'],
            },
            {
                name: 'Organic Market Bến Thành',
                image: 'https://images.unsplash.com/photo-1488459711615-228239793046?auto=format&fit=crop&q=80&w=800',
                address: 'Số 1 Bến Thành, Quận 1, TP.HCM',
                location: { type: 'Point', coordinates: [106.6985, 10.7725] },
                rating: 4.5,
                isVerified: true,
                isFeatured: true,
                discountLabel: 'Up to 50%',
                categories: ['Đồ khô', 'Sữa'],
            },
            {
                name: 'Siêu Thị Tiện Lợi 247',
                image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=800',
                address: '88 Nguyễn Huệ, Quận 1, TP.HCM',
                location: { type: 'Point', coordinates: [106.7035, 10.7745] },
                rating: 4.2,
                isVerified: false,
                isFeatured: false,
                categories: ['Tiện ích'],
            },
            {
                name: 'Nông Sản Xanh Dalat',
                image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=800',
                address: '24 Lê Lợi, Quận 1, TP.HCM',
                location: { type: 'Point', coordinates: [106.7005, 10.7755] },
                rating: 4.7,
                isVerified: true,
                isFeatured: true,
                discountLabel: 'Siêu Deal',
                categories: ['Rau củ', 'Nông sản'],
            },
            {
                name: 'Tiệm Bánh Mì Anh Bảy',
                image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
                address: '15 Bùi Viện, Quận 1, TP.HCM',
                location: { type: 'Point', coordinates: [106.6925, 10.7685] },
                rating: 4.6,
                isVerified: true,
                isFeatured: false,
                categories: ['Bánh mì', 'Ăn sáng'],
            },
            {
                name: 'VinMart+ Pasteur',
                image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
                address: '190 Pasteur, Quận 3, TP.HCM',
                location: { type: 'Point', coordinates: [106.6955, 10.7825] },
                rating: 4.3,
                isVerified: true,
                isFeatured: false,
                categories: ['Tổng hợp', 'Thực phẩm'],
            },
            {
                name: 'Hải Sản Tươi Sống 79',
                image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=800',
                address: '200 Trần Hưng Đạo, Quận 1, TP.HCM',
                location: { type: 'Point', coordinates: [106.6915, 10.7665] },
                rating: 4.9,
                isVerified: true,
                isFeatured: true,
                discountLabel: 'Freeship',
                categories: ['Hải sản', 'Thực phẩm tươi'],
            }
        ]);

        console.log('Shops Created...');

        // 2. Create Recipes and link to Shops
        const recipes = [
            {
                title: 'Phở Bò Gia Truyền',
                description: 'Món ăn quốc hồn quốc túy của Việt Nam với nước dùng đậm đà.',
                category: 'Bữa sáng',
                foodGroup: 'Phở',
                image: 'https://images.unsplash.com/photo-1582878826629-29b7adcdc43?q=80&w=1000&auto=format&fit=crop',
                ingredients: [
                    { name: 'Bánh phở', amount: '500g', price: 15000 },
                    { name: 'Thịt bò', amount: '200g', price: 60000 },
                ],
                instructions: ['Ninh xương 8 tiếng', 'Trần bánh phở'],
                costEstimate: 120000,
                shopId: (shops as any)[0]._id,
            },
            {
                title: 'Cơm Tấm Sườn Bì Chả',
                description: 'Đặc sản Sài Gòn nóng hổi.',
                category: 'Bữa trưa',
                foodGroup: 'Cơm',
                image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
                ingredients: [
                    { name: 'Gạo tấm', amount: '200g', price: 10000 },
                    { name: 'Sườn cốt lết', amount: '1 miếng', price: 25000 },
                ],
                instructions: ['Nướng sườn', 'Nấu cơm tấm'],
                costEstimate: 45000,
                shopId: (shops as any)[1]._id,
            },
            {
                title: 'Salad Ức Gà áp chảo',
                description: 'Món ăn lành mạnh, ít calo.',
                category: 'Bữa tối',
                foodGroup: 'Salad',
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
                ingredients: [
                    { name: 'Ức gà', amount: '150g', price: 20000 },
                ],
                instructions: ['áp chảo ức gà'],
                costEstimate: 35000,
                shopId: (shops as any)[0]._id,
            },
            {
                title: 'Bún Bò Huế',
                description: 'Hương vị cay nồng đặc trưng miền Trung.',
                category: 'Bữa sáng',
                foodGroup: 'Bún',
                image: 'https://images.unsplash.com/photo-1624509176332-959c9d8bf42c?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Thịt bò nạm', amount: '200g', price: 50000 }],
                instructions: ['Nấu nước dùng với mắm ruốc', 'Trần bún'],
                costEstimate: 65000,
                shopId: (shops as any)[0]._id,
            },
            {
                title: 'Mì Quảng Tôm Thịt',
                description: 'Món mì trứ danh đất Quảng.',
                category: 'Bữa trưa',
                foodGroup: 'Mì',
                image: 'https://images.unsplash.com/photo-1623912724490-2bd134375b43?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Sợi mì quảng', amount: '300g', price: 10000 }],
                instructions: ['Làm nước sốt tôm thịt'],
                costEstimate: 50000,
                shopId: (shops as any)[1]._id,
            },
            {
                title: 'Lẩu Thái Hải Sản',
                description: 'Lẩu chua cay cho những buổi tối xum vầy.',
                category: 'Bữa tối',
                foodGroup: 'Lẩu',
                image: 'https://images.unsplash.com/photo-1559844410-70fd755df491?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Tôm, mực', amount: '500g', price: 150000 }],
                instructions: ['Nấu nước dùng thái'],
                costEstimate: 250000,
                shopId: (shops as any)[6]._id,
            },
            {
                title: 'Trà Sữa Trân Châu Đường Đen',
                description: 'Đồ uống yêu thích của giới trẻ.',
                category: 'Ăn vặt',
                foodGroup: 'Đồ uống',
                image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Trà, sữa', amount: '1 ly', price: 15000 }],
                instructions: ['Pha trà sữa'],
                costEstimate: 45000,
                shopId: (shops as any)[2]._id,
            },
            {
                title: 'Bánh Mì Thịt Nướng',
                description: 'Bánh mì giòn rụm với thịt nướng thơm lừng.',
                category: 'Bữa sáng',
                foodGroup: 'Bánh mì',
                image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Bánh mì', amount: '1 cái', price: 5000 }],
                instructions: ['Nướng thịt', 'Kẹp bánh mì'],
                costEstimate: 20000,
                shopId: (shops as any)[4]._id,
            },
            {
                title: 'Cơm Gà Hải Nam',
                description: 'Thịt gà mềm ngọt, cơm thơm mùi gừng.',
                category: 'Bữa trưa',
                foodGroup: 'Cơm',
                image: 'https://images.unsplash.com/photo-1569058242253-92a9c71f9867?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Thịt gà', amount: '300g', price: 40000 }],
                instructions: ['Luộc gà', 'Nấu cơm với nước luộc gà'],
                costEstimate: 55000,
                shopId: (shops as any)[3]._id,
            },
            {
                title: 'Bún Chả Hà Nội',
                description: 'Đặc sản thủ đô với nước mắm chua ngọt.',
                category: 'Bữa trưa',
                foodGroup: 'Bún',
                image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Thit heo', amount: '200g', price: 30000 }],
                instructions: ['Nướng chả', 'Làm nước mắm'],
                costEstimate: 45000,
                shopId: (shops as any)[0]._id,
            },
            {
                title: 'Gỏi Cuốn Tôm Thịt',
                description: 'Món ăn nhẹ nhàng, tươi mát.',
                category: 'Bữa tối',
                foodGroup: 'Salad',
                image: 'https://images.unsplash.com/photo-1534422298391-e4f8c170db06?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Tôm', amount: '100g', price: 30000 }],
                instructions: ['Luộc tôm thịt', 'Cuốn với bánh tráng'],
                costEstimate: 60000,
                shopId: (shops as any)[6]._id,
            },
            {
                title: 'Cà Phê Muối',
                description: 'Hương vị cà phê độc đáo, đậm đà.',
                category: 'Ăn vặt',
                foodGroup: 'Đồ uống',
                image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Cà phê', amount: '1 phin', price: 10000 }],
                instructions: ['Pha cà phê', 'Làm kem muối'],
                costEstimate: 30000,
                shopId: (shops as any)[2]._id,
            },
            {
                title: 'Sushi Thập Cẩm',
                description: 'Tinh hoa ẩm thực Nhật Bản.',
                category: 'Bữa tối',
                foodGroup: 'Hải sản',
                image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Cá hồi', amount: '100g', price: 70000 }],
                instructions: ['Nấu cơm dấm', 'Thái cá hồi'],
                costEstimate: 180000,
                shopId: (shops as any)[6]._id,
            },
            {
                title: 'Bánh Xèo Miền Tây',
                description: 'Bánh xèo giòn tan với nhân tôm thịt.',
                category: 'Bữa chiều',
                foodGroup: 'Ăn vặt',
                image: 'https://images.unsplash.com/photo-1617460593290-e21.0?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Bột bánh xèo', amount: '200g', price: 15000 }],
                instructions: ['Đổ bánh xèo'],
                costEstimate: 50000,
                shopId: (shops as any)[3]._id,
            },
            {
                title: 'Mì Ý Sốt Bò Bằm',
                description: 'Món ăn phương Tây quen thuộc.',
                category: 'Bữa trưa',
                foodGroup: 'Mì',
                image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Mì Ý', amount: '200g', price: 20000 }],
                instructions: ['Luộc mì', 'Làm sốt bò bằm'],
                costEstimate: 80000,
                shopId: (shops as any)[5]._id,
            },
            {
                title: 'Matcha Latte',
                description: 'Thức uống thanh tao từ trà xanh Nhật Bản.',
                category: 'Ăn vặt',
                foodGroup: 'Đồ uống',
                image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Bột matcha', amount: '5g', price: 10000 }],
                instructions: ['Pha matcha latte'],
                costEstimate: 45000,
                shopId: (shops as any)[2]._id,
            },
            {
                title: 'Bún Riêu Cua',
                description: 'Hương vị ngọt thanh từ cua đồng.',
                category: 'Bữa sáng',
                foodGroup: 'Bún',
                image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Cua đồng', amount: '300g', price: 40000 }],
                instructions: ['Giã cua', 'Nấu nước dùng'],
                costEstimate: 40000,
                shopId: (shops as any)[0]._id,
            },
            {
                title: 'Lẩu Nấm Thiên Nhiên',
                description: 'Món lẩu thanh đạm, tốt cho sức khỏe.',
                category: 'Bữa tối',
                foodGroup: 'Lẩu',
                image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Các loại nấm', amount: '500g', price: 80000 }],
                instructions: ['Nấu nước dùng nấm'],
                costEstimate: 150000,
                shopId: (shops as any)[3]._id,
            },
            {
                title: 'Phở Gà Lá Chanh',
                description: 'Hương vị nhẹ nhàng, tinh tế.',
                category: 'Bữa sáng',
                foodGroup: 'Phở',
                image: 'https://images.unsplash.com/photo-1621213176330-ddcc8418043b?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Thịt gà ta', amount: '200g', price: 40000 }],
                instructions: ['Luộc gà', 'Nấu nước dùng gà'],
                costEstimate: 50000,
                shopId: (shops as any)[1]._id,
            },
            {
                title: 'Bún Đậu Mắm Tôm',
                description: 'Món ăn dân dã nhưng cực kỳ gây nghiện.',
                category: 'Bữa trưa',
                foodGroup: 'Bún',
                image: 'https://images.unsplash.com/photo-1617460593290-e2d45388066f?auto=format&fit=crop&q=80&w=800',
                ingredients: [{ name: 'Đậu hũ', amount: '2 miếng', price: 6000 }],
                instructions: ['Rán đậu', 'Chuẩn bị mắm tôm'],
                costEstimate: 40000,
                shopId: (shops as any)[3]._id,
            },
            // --- NEW SIDES & DRINKS ---
            {
                title: 'Quẩy giòn',
                description: 'Ăn kèm với phở hoặc bún riêu.',
                category: 'Món thêm',
                foodGroup: 'Món thêm',
                image: 'https://images.unsplash.com/photo-1621213176330-ddcc8418043b?q=80&w=1000&auto=format&fit=crop',
                ingredients: [{ name: 'Bột mì', amount: '1 cái', price: 2000 }],
                instructions: ['Chiên giòn'],
                costEstimate: 5000,
                shopId: (shops as any)[0]._id, // Fresh Garden
            },
            {
                title: 'Trứng ốp la',
                description: 'Trứng gà tươi chiên lòng đào.',
                category: 'Món thêm',
                foodGroup: 'Món thêm',
                image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1000&auto=format&fit=crop',
                ingredients: [{ name: 'Trứng gà', amount: '1 quả', price: 5000 }],
                instructions: ['Chiên ốp la'],
                costEstimate: 10000,
                shopId: (shops as any)[1]._id, // Organic Market
            },
            {
                title: 'Trà đá Fresh',
                description: 'Trà xanh đá lạnh giải khát.',
                category: 'Đồ uống',
                foodGroup: 'Đồ uống',
                image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=1000&auto=format&fit=crop',
                ingredients: [{ name: 'Trà xanh, đá', amount: '1 ly', price: 2000 }],
                instructions: ['Pha trà'],
                costEstimate: 5000,
                shopId: (shops as any)[0]._id,
            },
            {
                title: 'Coca Cola',
                description: 'Nước ngọt có gas 330ml.',
                category: 'Đồ uống',
                foodGroup: 'Đồ uống',
                image: 'https://images.unsplash.com/photo-1622483767028-3f66f3445078?q=80&w=1000&auto=format&fit=crop',
                ingredients: [{ name: 'Coca', amount: '1 lon', price: 12000 }],
                instructions: ['Bật nắp'],
                costEstimate: 15000,
                shopId: (shops as any)[1]._id,
            },
            {
                title: 'Nước suối Lavie',
                description: 'Nước khoáng thiên nhiên 500ml.',
                category: 'Đồ uống',
                foodGroup: 'Đồ uống',
                image: 'https://images.unsplash.com/photo-1523362628742-0c582c5eead1?q=80&w=1000&auto=format&fit=crop',
                ingredients: [{ name: 'Nước suối', amount: '1 chai', price: 6000 }],
                instructions: ['Bật nắp'],
                costEstimate: 10000,
                shopId: (shops as any)[4]._id, // Bánh mì Anh Bảy
            },
            {
                title: 'Cà phê đá',
                description: 'Cà phê đen truyền thống.',
                category: 'Đồ uống',
                foodGroup: 'Đồ uống',
                image: 'https://images.unsplash.com/photo-1559496417-e7f20ec2478e?q=80&w=1000&auto=format&fit=crop',
                ingredients: [{ name: 'Cà phê', amount: '1 ly', price: 15000 }],
                instructions: ['Pha máy'],
                costEstimate: 25000,
                shopId: (shops as any)[4]._id,
            }
        ];

        await Recipe.create(recipes);
        console.log('Recipes Created...');

        // 3. Create Banners
        const banners = [
            {
                title: 'Giảm giá 50% thực phẩm tươi sống',
                image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
                link: '/(tabs)/local',
                active: true,
            },
            {
                title: 'Công thức nấu ăn đặc biệt cho cuối tuần',
                image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
                link: '/(tabs)/index',
                active: true,
            },
            {
                title: 'Tham gia cộng đồng đầu bếp trẻ',
                image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800',
                link: '/(tabs)/community',
                active: true,
            }
        ];

        await Banner.create(banners);
        console.log('Banners Created...');

        // Important: Create indexes for geospatial search
        await Shop.createIndexes();
        console.log('Geospatial Indexes Created...');

        console.log('All Data Imported Successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

const deleteData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        await Recipe.deleteMany();
        await Banner.deleteMany();
        await Shop.deleteMany();

        console.log('Data Destroyed...');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}
