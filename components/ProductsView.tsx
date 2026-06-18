import React from 'react';
import { motion } from 'motion/react';
import { Product, useLanguage } from '../types';
import { 
    ShoppingBag, 
    Zap, 
    Leaf, 
    Wrench, 
    ArrowUpRight,
    Star,
    Info,
    ShieldCheck,
    Truck
} from 'lucide-react';

const ProductsView: React.FC = () => {
    const { language } = useLanguage();
    const isFA = language === 'fa';

    const products: Product[] = [
        {
            id: 'P001',
            name: isFA ? 'کیت پایش هوشمند خاکی IoT (مدل زاگرس)' : 'IoT Soil Sensing Kit (Zagros Edition)',
            price: '$120',
            category: 'tech',
            description: isFA ? 'سیستم پایش رطوبت، دما و سلامت خاک با اتصال ماهواره‌ای.' : 'Real-time soil health monitoring with satellite uplink for remote forest nodes.',
            specs: [isFA ? 'اتصال لورا (LoRa)' : 'LoRaWAN Support', '3+ Year Battery', 'UV Resistant Body'],
            image: 'https://images.unsplash.com/photo-1594818451737-023a7895780f?q=80&w=300&h=300&auto=format&fit=crop',
            stock: 15
        },
        {
            id: 'P002',
            name: isFA ? 'نهال بلوط زاگرس (گونه دیمه)' : 'Zagros Oak Seedling (Deymeh Native)',
            price: '$8',
            category: 'seeds',
            description: isFA ? 'بلوط مقاوم به خشکی، اختصاصی برای بازسازی جنگل‌های غرب ایران.' : 'Drought-resistant oak seedlings specifically bred for Western Iran reforestation.',
            specs: [isFA ? '۲ ساله' : '2-Year Rooted', isFA ? 'بدون نیاز به آبیاری مداوم' : 'No Irrigation Required'],
            image: 'https://images.unsplash.com/photo-1597843798188-f67f13ec9ce4?q=80&w=300&h=300&auto=format&fit=crop',
            stock: 500
        },
        {
            id: 'P003',
            name: isFA ? 'دریل مچی کاشت بذر (تکنولوژی ژئوهوپ)' : 'Precision Seed Drill (GeoHope Tech)',
            price: '$45',
            category: 'tools',
            description: isFA ? 'ابزار سبک وزن برای کاشت بذر در مناطق صعب‌العبور کوهستانی.' : 'Lightweight handheld tool for precise seed placement in mountainous terrains.',
            specs: [isFA ? 'وزن: ۸۰۰ گرم' : 'Weight: 800g', isFA ? 'بدنه تیتانیوم' : 'Titanium Build'],
            image: 'https://images.unsplash.com/photo-1530124560677-bdaeaef2f9cd?q=80&w=300&h=300&auto=format&fit=crop',
            stock: 24
        }
    ];

    const getCategoryIcon = (cat: Product['category']) => {
        switch (cat) {
            case 'tech': return <Zap className="w-4 h-4" />;
            case 'seeds': return <Leaf className="w-4 h-4" />;
            case 'tools': return <Wrench className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                        <ShoppingBag className="w-10 h-10 text-emerald-400" />
                        {isFA ? 'فروشگاه تدارکات سبز' : 'Green Logistics Hub'}
                    </h2>
                    <p className="text-slate-400 font-medium mt-2 max-w-xl">
                        {isFA ? 'تامین ابزارهای تکنولوژیک و بیولوژیک برای احیاء زاگرس' : 'Sourcing advanced biological and technological assets for forest recovery.'}
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        {isFA ? 'صلاحیت تایید شده' : 'Verified Quality'}
                    </div>
                    <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-300">
                        <Truck className="w-4 h-4 text-blue-500" />
                        {isFA ? 'ارسال به محل پروژه' : 'Direct Project Delivery'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product, idx) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.15 }}
                        className="group bg-slate-900/60 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col hover:border-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-emerald-950/20"
                    >
                        <div className="relative h-64 overflow-hidden">
                            <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-4 left-4 right-4 flex justify-between">
                                <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                                    {getCategoryIcon(product.category)}
                                    {product.category}
                                </div>
                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/40">
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-black text-white leading-tight group-hover:text-emerald-400 transition-colors">{product.name}</h3>
                                <span className="text-xl font-black text-emerald-500">{product.price}</span>
                            </div>
                            
                            <p className="text-slate-400 text-sm font-medium mb-6 line-clamp-2">
                                {product.description}
                            </p>

                            <div className="space-y-2 mb-8">
                                {product.specs.map((spec, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                        <Info className="w-3 h-3 text-slate-400" />
                                        {spec}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto flex items-center gap-3">
                                <button className="flex-1 py-3 bg-white text-slate-950 font-black rounded-2xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2">
                                    {isFA ? 'افزودن به تدارکات' : 'Add to Logistics'}
                                </button>
                                <button className="w-12 h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl flex items-center justify-center transition">
                                    <ArrowUpRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-slate-950 border border-white/5 rounded-[3rem] p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_70%)]" />
                <h3 className="text-2xl font-black text-white mb-4 relative z-10">{isFA ? 'سفارش سفارشی برای مناطق خاص' : 'Bulk Custom Seedling Orders'}</h3>
                <p className="text-slate-400 max-w-2xl mx-auto mb-8 relative z-10">
                    {isFA ? 'اگر نیاز به بیش از ۵۰۰۰ اصله نهال برای یک منطقه حفاظت شده دارید، با واحد لجستیک امید سبز تماس بگیرید.' : 'For orders exceeding 5,000 units or specific regional genotypes, please contact our professional procurement node.'}
                </p>
                <div className="relative z-10 flex flex-wrap justify-center gap-12 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                    <span>Secure Packaging</span>
                    <span>Climate Tracking</span>
                    <span>Verified Origins</span>
                </div>
            </div>
        </div>
    );
};

export default ProductsView;
