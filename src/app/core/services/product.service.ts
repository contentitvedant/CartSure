import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore } from '@angular/fire/firestore';
import { collection, doc, query, where, addDoc, getDocs, getDoc } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  thumbnails: string[];
  colors?: string[];
  specs?: string[];
  category: string;
  featured: boolean;
  popularity: number;
  stock: number;
}

const MOCK_DATA = [
  {
    name: 'MacBook Pro 16"',
    description: 'Supercharged for pros. The most powerful MacBook ever. Featuring the blazing-fast M3 Pro or M3 Max chip, a brilliant Liquid Retina XDR display, and up to 22 hours of battery life.',
    price: 249900,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Space Black', 'Silver'],
    specs: ['18GB Unified Memory', '512GB SSD', '36GB Unified Memory', '1TB SSD'],
    category: 'Mac',
    featured: true,
    popularity: 98,
    stock: 15
  },
  {
    name: 'iPhone 15 Pro',
    description: 'Titanium. So strong. So light. So Pro. Features A17 Pro chip, Action button, and the most advanced camera system ever.',
    price: 134900,
    imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1696756857946-b37bbce6b42b?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
    specs: ['128GB', '256GB', '512GB', '1TB'],
    category: 'iPhone',
    featured: true,
    popularity: 100,
    stock: 42
  },
  {
    name: 'AirPods Pro',
    description: 'Adaptive Audio. Now playing. Active Noise Cancellation, personalized Spatial Audio, and up to 6 hours of listening time on a single charge.',
    price: 24900,
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['White'],
    specs: ['Standard'],
    category: 'Accessories',
    featured: true,
    popularity: 95,
    stock: 120
  },
  {
    name: 'Apple Watch Ultra 2',
    description: 'Next level adventure. The most rugged and capable Apple Watch pushes the limits again.',
    price: 89900,
    imageUrl: 'https://images.unsplash.com/photo-1695048064971-ce20cbb715bb?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1695048064971-ce20cbb715bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1695048065363-2253027b5f54?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Natural Titanium'],
    specs: ['Alpine Loop', 'Trail Loop', 'Ocean Band'],
    category: 'Watch',
    featured: false,
    popularity: 88,
    stock: 8
  },
  {
    name: 'iPad Pro 12.9"',
    description: 'The ultimate iPad experience. Features M2 chip, Apple Pencil hover, and ProRes video capture.',
    price: 119900,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Space Gray', 'Silver'],
    specs: ['128GB', '256GB', '512GB', '1TB', '2TB'],
    category: 'iPad',
    featured: false,
    popularity: 85,
    stock: 25
  },
  {
    name: 'MacBook Air M2',
    description: 'Don’t take it lightly. Strikingly thin design. Blazing-fast M2 chip. Up to 18 hours of battery life.',
    price: 114900,
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Midnight', 'Starlight', 'Space Gray', 'Silver'],
    specs: ['8GB Memory, 256GB SSD', '16GB Memory, 512GB SSD'],
    category: 'Mac',
    featured: false,
    popularity: 92,
    stock: 30
  },
  {
    name: 'Magic Keyboard',
    description: 'A comfortable and precise typing experience. Pairs automatically with your Mac.',
    price: 9900,
    imageUrl: 'https://images.unsplash.com/photo-1588508065123-287b28e01397?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1588508065123-287b28e01397?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['White', 'Black'],
    specs: ['Standard', 'With Touch ID', 'With Numeric Keypad'],
    category: 'Accessories',
    featured: false,
    popularity: 75,
    stock: 50
  },
  {
    name: 'iPhone 15',
    description: 'Newphoria. Dynamic Island. 48MP Main camera. USB-C. A breathtaking all-new design.',
    price: 79900,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Pink', 'Yellow', 'Green', 'Blue', 'Black'],
    specs: ['128GB', '256GB', '512GB'],
    category: 'iPhone',
    featured: false,
    popularity: 90,
    stock: 0
  }
];

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firestore = inject(Firestore);

  constructor() { }

  private sanitizeProduct(id: string, data: any): Product {
    const fallbackImage = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80';
    
    // Map product names to specific unsplash images from MOCK_DATA to keep it realistic
    let defaultImg = fallbackImage;
    const name = data.name?.toLowerCase() || '';
    if (name.includes('macbook pro')) {
      defaultImg = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80';
    } else if (name.includes('iphone 15 pro')) {
      defaultImg = 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80';
    } else if (name.includes('airpods pro')) {
      defaultImg = 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80';
    } else if (name.includes('watch ultra')) {
      defaultImg = 'https://images.unsplash.com/photo-1695048064971-ce20cbb715bb?auto=format&fit=crop&w=800&q=80';
    } else if (name.includes('ipad pro')) {
      defaultImg = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80';
    } else if (name.includes('macbook air')) {
      defaultImg = 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80';
    } else if (name.includes('keyboard')) {
      defaultImg = 'https://images.unsplash.com/photo-1588508065123-287b28e01397?auto=format&fit=crop&w=800&q=80';
    } else if (name.includes('iphone 15')) {
      defaultImg = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80';
    }

    const imageUrl = data.imageUrl && !data.imageUrl.includes('localhost') ? data.imageUrl : defaultImg;
    const thumbnails = data.thumbnails && Array.isArray(data.thumbnails)
      ? data.thumbnails.map((t: string) => t && !t.includes('localhost') ? t : defaultImg)
      : [imageUrl];

    return {
      id,
      ...data,
      imageUrl,
      thumbnails
    } as Product;
  }

  getFeaturedProducts(): Observable<Product[]> {
    const q = query(collection(this.firestore, 'products'), where('featured', '==', true));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => this.sanitizeProduct(doc.id, doc.data())))
    );
  }

  getAllProducts(): Observable<Product[]> {
    console.log('Fetching all products from Firestore...');
    const productsRef = collection(this.firestore, 'products');
    return from(getDocs(productsRef)).pipe(
      map(snapshot => {
        const products = snapshot.docs.map(doc => this.sanitizeProduct(doc.id, doc.data()));
        console.log(`Fetched ${products.length} products`);
        return products;
      })
    );
  }

  getCategories(): Observable<string[]> {
    return this.getAllProducts().pipe(
      map(products => Array.from(new Set(products.map(p => p.category))))
    );
  }

  getProductById(id: string): Observable<Product> {
    const docRef = doc(this.firestore, `products/${id}`);
    return from(getDoc(docRef)).pipe(
      map(snapshot => {
        if (!snapshot.exists()) throw new Error('Product not found');
        return this.sanitizeProduct(snapshot.id, snapshot.data());
      })
    );
  }

  async seedDatabaseIfEmpty() {
    try {
      console.log('Checking if database needs seeding...');
      const productsRef = collection(this.firestore, 'products');
      const snapshot = await getDocs(query(productsRef));

      if (snapshot.empty) {
        console.log('Firestore is empty. Migrating mock dataset into cloud...');
        for (const productData of MOCK_DATA) {
          await addDoc(productsRef, productData);
        }
        console.info('Database seeding completed successfully ✅');
      } else {
        console.log(`Database already contains ${snapshot.size} products.`);
      }
    } catch (e: any) {
      console.error('Could not seed database. Error:', e.message);
      console.warn('Check Firestore Rules - you likely need to allow "read" and "write" for the "products" collection.');
    }
  }
}
