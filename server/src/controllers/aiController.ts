import { Request, Response } from 'express';
import Blog from '../models/Blog';
import Recipe from '../models/Recipe';

// Simple mock AI logic for culinary advice
export const askAI = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'Please provide a message' });
        }

        const query = message.toLowerCase();
        let answer = "Xin chào! Tôi là trợ lý nấu ăn của FreshRoot. Tôi có thể giúp bạn tìm hiểu về cách nấu, chất lượng nguyên liệu và các cảnh báo rủi ro thực phẩm.";

        // Search in Blogs for relevant info
        const relatedBlogs = await Blog.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } }
            ]
        }).limit(2);

        // Search in Recipes
        const relatedRecipes = await Recipe.find({
            title: { $regex: query, $options: 'i' }
        }).limit(2);

        if (relatedBlogs.length > 0) {
            const blog = relatedBlogs[0];
            if (blog) {
                const title = blog.title || '';
                const description = blog.description || '';
                answer = `Dựa trên mẹo nấu ăn của chúng tôi về "${title}": ${description}. Bạn có thể xem chi tiết trong mục Cộng đồng!`;

                if (blog.riskAlerts && blog.riskAlerts.length > 0) {
                    answer += `\n\n⚠️ Cảnh báo rủi ro: ${blog.riskAlerts.join(', ')}`;
                }
            }
        } else if (relatedRecipes.length > 0) {
            const recipe = relatedRecipes[0];
            if (recipe) {
                const title = recipe.title || '';
                const category = recipe.category || '';
                const ingredients = recipe.ingredients ? recipe.ingredients.map((i: any) => i.name).join(', ') : '';
                answer = `Tôi tìm thấy món "${title}". Món này thuộc chuyên mục ${category}. Bạn cần chuẩn bị: ${ingredients}.`;

                if (recipe.riskAlerts && recipe.riskAlerts.length > 0) {
                    answer += `\n\n⚠️ Chú ý an toàn: ${recipe.riskAlerts.join(', ')}`;
                }
            }
        } else {
            // General responses based on keywords
            if (query.includes('độc hại') || query.includes('rủi ro') || query.includes('nguy hiểm')) {
                answer = "Về các rủi ro thực phẩm, bạn nên chú ý kiểm tra nguồn gốc, hạn sử dụng và các dấu hiệu bị hỏng như mùi lạ hoặc đổi màu. FreshRoot luôn sàng lọc kỹ các đối tác để đảm bảo an toàn.";
            } else if (query.includes('cách nấu') || query.includes('hướng dẫn')) {
                answer = "Bạn có thể vào mục 'Thực đơn' để xem hàng ngàn công thức nấu ăn ngon với hướng dẫn chi tiết từng bước!";
            } else if (query.includes('nguyên liệu') || query.includes('chất lượng')) {
                answer = "Việc chọn nguyên liệu tươi ngon là chìa khóa của món ăn. Hãy ưu tiên các loại rau quả theo mùa và thực phẩm có chứng nhận VietGAP/Organic.";
            }
        }

        res.json({
            success: true,
            data: {
                reply: answer,
                sender: 'FreshRoot AI',
                timestamp: new Date()
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
