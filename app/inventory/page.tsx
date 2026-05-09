'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Product {
	id: string;
	name: string;
	price: number;
	description: string;
	sizes: string[];
	colors: string[];
	tags: string[];
	created_at: string;
}

interface FormData {
	name: string;
	price: string;
	description: string;
	sizes: string;
	colors: string;
	tags: string;
}

export default function InventoryPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(false);
	const [deleting, setDeleting] = useState<string | null>(null);
	const [formData, setFormData] = useState<FormData>({
		name: '',
		price: '',
		description: '',
		sizes: '',
		colors: '',
		tags: '',
	});

	// Fetch all products from Supabase
	const fetchProducts = async () => {
		try {
			setLoading(true);
			const client = supabase;
			if (!client) {
				console.error('Supabase not configured');
				return;
			}

			const { data, error } = await client
				.from('products')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) {
				console.error('Error fetching products:', error);
				alert('Lỗi khi tải sản phẩm: ' + error.message);
				return;
			}

			setProducts(data || []);
		} catch (error) {
			console.error('Unexpected error:', error);
		} finally {
			setLoading(false);
		}
	};

	// Add new product to Supabase
	const addProduct = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim() || !formData.price) {
			alert('Vui lòng điền tên sản phẩm và giá tiền');
			return;
		}

		try {
			setLoading(true);
			const client = supabase;
			if (!client) {
				alert('Supabase chưa được cấu hình. Kiểm tra biến môi trường.');
				return;
			}

			// Transform comma-separated strings to arrays
			const sizesArray = formData.sizes
				.split(',')
				.map((s) => s.trim())
				.filter((s) => s);

			const colorsArray = formData.colors
				.split(',')
				.map((c) => c.trim())
				.filter((c) => c);

			const tagsArray = formData.tags
				.split(',')
				.map((t) => t.trim())
				.filter((t) => t);

			const { error } = await client.from('products').insert([
				{
					name: formData.name.trim(),
					price: parseFloat(formData.price),
					description: formData.description.trim(),
					sizes: sizesArray.length > 0 ? sizesArray : null,
					colors: colorsArray.length > 0 ? colorsArray : null,
					tags: tagsArray.length > 0 ? tagsArray : null,
				},
			]);

			if (error) {
				console.error('Error adding product:', error);
				alert('Lỗi khi thêm sản phẩm: ' + error.message);
				return;
			}

			// Clear form
			setFormData({
				name: '',
				price: '',
				description: '',
				sizes: '',
				colors: '',
				tags: '',
			});

			// Refresh product list
			await fetchProducts();
			alert('Thêm sản phẩm thành công!');
		} catch (error) {
			console.error('Unexpected error:', error);
			alert('Lỗi không xác định khi thêm sản phẩm');
		} finally {
			setLoading(false);
		}
	};

	// Delete product
	const deleteProduct = async (id: string) => {
		if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) {
			return;
		}

		try {
			setDeleting(id);
			const client = supabase;
			if (!client) {
				alert('Supabase chưa được cấu hình.');
				return;
			}

			const { error } = await client
				.from('products')
				.delete()
				.eq('id', id);

			if (error) {
				console.error('Error deleting product:', error);
				alert('Lỗi khi xóa sản phẩm: ' + error.message);
				return;
			}

			// Refresh product list
			await fetchProducts();
			alert('Xóa sản phẩm thành công!');
		} catch (error) {
			console.error('Unexpected error:', error);
			alert('Lỗi không xác định khi xóa sản phẩm');
		} finally {
			setDeleting(null);
		}
	};

	// Load products on component mount
	useEffect(() => {
		fetchProducts();
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-white mb-2">
						Quản Lý Kho Hàng
					</h1>
					<p className="text-gray-400">Quản lý danh sách sản phẩm và tồn kho</p>
				</div>

				{/* Form Section */}
				<div className="bg-gray-800 rounded-lg shadow-xl p-8 mb-8 border border-gray-700">
					<h2 className="text-2xl font-bold text-white mb-6 flex items-center">
						<span className="mr-3 text-green-500 text-2xl">＋</span>
						Thêm Sản Phẩm Mới
					</h2>

					<form onSubmit={addProduct} className="space-y-6">
						{/* Grid 2 Columns */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Tên Sản Phẩm */}
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Tên Sản Phẩm
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									placeholder="Nhập tên sản phẩm"
									className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
									disabled={loading}
								/>
							</div>

							{/* Giá Tiền */}
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Giá Tiền (VNĐ)
								</label>
								<input
									type="number"
									value={formData.price}
									onChange={(e) =>
										setFormData({ ...formData, price: e.target.value })
									}
									placeholder="0"
									className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
									disabled={loading}
									step="1000"
									min="0"
								/>
							</div>

							{/* Mô Tả */}
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Mô Tả
								</label>
								<textarea
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									placeholder="Nhập mô tả sản phẩm"
									rows={3}
									className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition resize-none"
									disabled={loading}
								/>
							</div>

							{/* Size */}
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Size
									<span className="text-xs text-gray-500 ml-2">
										(Ngăn cách bởi dấu phẩy: S, M, L)
									</span>
								</label>
								<input
									type="text"
									value={formData.sizes}
									onChange={(e) =>
										setFormData({ ...formData, sizes: e.target.value })
									}
									placeholder="S, M, L, XL"
									className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
									disabled={loading}
								/>
							</div>

							{/* Màu Sắc */}
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Màu Sắc
									<span className="text-xs text-gray-500 ml-2">
										(Ngăn cách bởi dấu phẩy: Đỏ, Xanh)
									</span>
								</label>
								<input
									type="text"
									value={formData.colors}
									onChange={(e) =>
										setFormData({ ...formData, colors: e.target.value })
									}
									placeholder="Đỏ, Xanh, Vàng, Đen"
									className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
									disabled={loading}
								/>
							</div>

							{/* Tags AI */}
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Tags Nhận Diện cho AI
									<span className="text-xs text-gray-500 ml-2">
										(Từ khóa: 50kg, mùa hè, lụa)
									</span>
								</label>
								<input
									type="text"
									value={formData.tags}
									onChange={(e) =>
										setFormData({ ...formData, tags: e.target.value })
									}
									placeholder="50kg, mùa hè, lụa, premium"
									className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
									disabled={loading}
								/>
							</div>
						</div>

						{/* Submit Button */}
						<div className="flex justify-end pt-4">
							<button
								type="submit"
								disabled={loading}
								className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition flex items-center gap-2 text-lg"
							>
								<span className="text-xl leading-none">＋</span>
								Thêm Sản Phẩm
							</button>
						</div>
					</form>
				</div>

				{/* Table Section */}
				<div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
					<div className="p-6 border-b border-gray-700">
						<h2 className="text-2xl font-bold text-white">
							Danh Sách Sản Phẩm ({products.length})
						</h2>
					</div>

					{loading && !deleting ? (
						<div className="p-8 text-center text-gray-400">
							Đang tải dữ liệu...
						</div>
					) : products.length === 0 ? (
						<div className="p-8 text-center text-gray-400">
							Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="bg-gray-700 border-b border-gray-600">
										<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
											Tên Sản Phẩm
										</th>
										<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
											Giá (VNĐ)
										</th>
										<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
											Mô Tả
										</th>
										<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
											Size
										</th>
										<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
											Màu Sắc
										</th>
										<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
											Tags AI
										</th>
										<th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
											Hành Động
										</th>
									</tr>
								</thead>
								<tbody>
									{products.map((product) => (
										<tr
											key={product.id}
											className="border-b border-gray-700 hover:bg-gray-700/50 transition"
										>
											<td className="px-6 py-4 text-white font-medium">
												{product.name}
											</td>
											<td className="px-6 py-4 text-green-400 font-semibold">
												{product.price.toLocaleString('vi-VN')} ₫
											</td>
											<td className="px-6 py-4 text-gray-300 max-w-xs truncate">
												{product.description || '—'}
											</td>
											<td className="px-6 py-4">
												{product.sizes && product.sizes.length > 0 ? (
													<div className="flex flex-wrap gap-1">
														{product.sizes.map((size, idx) => (
															<span
																key={idx}
																className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
															>
																{size}
															</span>
														))}
													</div>
												) : (
													<span className="text-gray-500">—</span>
												)}
											</td>
											<td className="px-6 py-4">
												{product.colors && product.colors.length > 0 ? (
													<div className="flex flex-wrap gap-1">
														{product.colors.map((color, idx) => (
															<span
																key={idx}
																className="bg-purple-600 text-white text-xs px-2 py-1 rounded"
															>
																{color}
															</span>
														))}
													</div>
												) : (
													<span className="text-gray-500">—</span>
												)}
											</td>
											<td className="px-6 py-4">
												{product.tags && product.tags.length > 0 ? (
													<div className="flex flex-wrap gap-1">
														{product.tags.map((tag, idx) => (
															<span
																key={idx}
																className="bg-yellow-600 text-white text-xs px-2 py-1 rounded"
															>
																{tag}
															</span>
														))}
													</div>
												) : (
													<span className="text-gray-500">—</span>
												)}
											</td>
											<td className="px-6 py-4 text-center">
												<button
													onClick={() => deleteProduct(product.id)}
													disabled={
														deleting === product.id || loading
													}
													className="bg-red-600 hover:bg-red-700 disabled:bg-red-500 disabled:cursor-not-allowed text-white p-2 rounded transition inline-flex items-center gap-2"
												>
													<span className="text-sm leading-none">🗑️</span>
													{deleting === product.id && (
														<span>Xóa...</span>
													)}
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
