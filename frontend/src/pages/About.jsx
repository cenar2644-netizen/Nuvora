import React from 'react'
import Title from '../components/Title';
import NewsletterBox from '../components/NewsletterBox';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2 = {'US'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>We created Nuvora with a simple idea: to make contemporary fashion accessible, effortless, and enjoyable for everyone. Our collections bring together carefully selected styles for men, women, and kids, combining timeless essentials with modern trends to suit every personality and occasion.</p>
          <p>From everyday wardrobe staples to pieces that make a statement, we’re committed to helping you discover fashion that feels uniquely yours. We believe great style should be easy to find, comfortable to wear, and made to fit your everyday life.</p>
          <b className='text-gray-800'>Our Mission</b>
          <p>Our mission is to make great fashion accessible to everyone.
We strive to offer a thoughtfully curated range of clothing that balances style, quality, comfort, and value. As Nuvora grows, we aim to build a fashion experience our customers can rely on — from discovering new styles to receiving them at their doorstep.</p>
        </div>
      </div>
      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE NUVORA'}/>
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Style for Everyone:</b>
          <p className='text-gray-600'>From timeless essentials to modern trends, our collections are designed for men, women, and kids, making it easy for every member of the family to find something they love.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality You Can Trust::</b>
          <p className='text-gray-600'>We carefully select our products with a focus on quality, comfort, and lasting style, so you can shop with confidence and enjoy your favorite pieces for longer..</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Fashion Made Simple:</b>
          <p className='text-gray-600'>We believe shopping for fashion should be effortless. With an easy-to-use online experience, carefully curated collections, and convenient ordering, Nuvora makes finding your next look simple.</p>
        </div>
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default About;
