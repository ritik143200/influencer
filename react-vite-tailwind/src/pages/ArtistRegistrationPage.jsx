import React, { useState } from 'react';
import { useRouter } from '../contexts/RouterContext';

const ArtistRegistrationPage = ({ config }) => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profileType: 'artist',
    artistType: '',
    location: '',
    categories: [],
    subcategories: [],
    socialLinks: {
      youtube: '',
      instagram: ''
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [showSubcategoryPopup, setShowSubcategoryPopup] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [subcategorySearchQuery, setSubcategorySearchQuery] = useState('');

  const allCategoriesData = {
    singers: {
      name: 'Singers',
      icon: '🎤',
      subcategories: {
        western: { name: 'Western', icon: '🎸', items: ['Jazz', 'Blues', 'Opera', 'Pop', 'Country', 'Gospel'] },
        bollywood: { name: 'Bollywood', icon: '🎬', items: ['Playback', 'Cover', 'Mashup'] },
        folk: { name: 'Folk', icon: '🪘', items: ['Rajasthani', 'Punjabi', 'Bhojpuri', 'Malwi', 'Lavani', 'Baul', 'Tribal'] },
        devotional: { name: 'Devotional', icon: '🙏', items: ['Bhajan', 'Kirtan', 'Gurbani', 'Aarti'] },
        modern: { name: 'Modern', icon: '🎧', items: ['Indie', 'Rap', 'Hip-Hop', 'EDM Vocalists'] },
        classical: { name: 'Classical', icon: '🎵', items: ['Hindustani', 'Carnatic', 'Ghazal', 'Sufi', 'Qawwali'] }
      }
    },
    anchors: {
      name: 'Anchors',
      icon: '🎤',
      subcategories: {
        wedding: { name: 'Wedding Anchors', icon: '💒', items: ['Wedding Anchors', 'Event Anchors', 'Ceremony Anchors'] },
        corporate: { name: 'Corporate Anchors', icon: '🏢', items: ['Corporate Anchors', 'Business Anchors', 'Conference Anchors'] },
        government: { name: 'Government Event Anchors', icon: '🏛️', items: ['Government Anchors', 'Official Event Anchors', 'Public Service Anchors'] },
        festival: { name: 'Festival / Public Anchors', icon: '🎉', items: ['Festival Anchors', 'Public Event Anchors', 'Community Anchors'] }
      }
    },
    bands: {
      name: 'Bands',
      icon: '🎸',
      subcategories: {
        classical: { name: 'Classical', icon: '🎵', items: ['Hindustani', 'Carnatic', 'Ghazal', 'Sufi', 'Qawwali'] },
        devotional: { name: 'Devotional', icon: '🙏', items: ['Bhajan', 'Kirtan', 'Gurbani', 'Aarti'] },
        bollywood: { name: 'Bollywood Bands', icon: '🎬', items: ['Bollywood Bands', 'Film Bands', 'Music Bands'] },
        folk: { name: 'Folk Bands', icon: '🪘', items: ['Folk Bands', 'Traditional Bands', 'Cultural Bands'] },
        western: { name: 'Western Bands', icon: '🎸', items: ['Rock Bands', 'Pop Bands', 'Jazz Bands'] },
        modern: { name: 'Modern Bands', icon: '🎧', items: ['Indie', 'Rap', 'Hip-Hop', 'EDM'] },
        rock: { name: 'Rock / Metal / Fusion Bands', icon: '🎸', items: ['Rock Bands', 'Metal Bands', 'Fusion Bands'] },
        wedding: { name: 'Wedding & College Bands', icon: '💒', items: ['Wedding Bands', 'College Bands', 'Event Bands'] },
        acoustic: { name: 'Acoustic / EDM / Techno Groups', icon: '🎵', items: ['Acoustic Groups', 'EDM Groups', 'Techno Groups'] }
      }
    },
    instrumentalists: {
      name: 'Instrumentalists',
      icon: '🎼',
      subcategories: {
        indian_classical: { name: 'Indian Classical', icon: '🎵', items: ['Flute', 'Sitar', 'Tabla', 'Veena', 'Harmonium'] },
        western: { name: 'Western', icon: '🎸', items: ['Guitar', 'Piano', 'Violin', 'Saxophone', 'Drums'] },
        fusion: { name: 'Fusion', icon: '🎵', items: ['Handpan', 'Cajón', 'Loop Station', 'Beatboxing'] }
      }
    },
    dancers: {
      name: 'Dancers',
      icon: '💃',
      subcategories: {
        classical: { name: 'Classical', icon: '🎭', items: ['Bharatanatyam', 'Kathak', 'Odissi', 'Kuchipudi', 'Manipuri'] },
        folk: { name: 'Folk', icon: '🪘', items: ['Bhangra', 'Garba', 'Ghoomar', 'Lavani', 'Baul'] },
        western: { name: 'Western', icon: '💃', items: ['Salsa', 'Tango', 'Ballroom', 'Swing'] },
        street: { name: 'Street', icon: '🕺', items: ['Hip-Hop', 'B-Boying', 'Krumping', 'Waacking'] },
        contemporary: { name: 'Contemporary', icon: '🩰', items: ['Ballet', 'Jazz Fusion', 'Modern Dance'] },
        specialty: { name: 'Specialty', icon: '🔥', items: ['Belly Dance', 'Aerial', 'Fire Dance', 'LED Dance'] }
      }
    },
    choreographers: {
      name: 'Choreographers',
      icon: '🕺',
      subcategories: {
        bollywood: { name: 'Bollywood / Film', icon: '🎬', items: ['Film Choreographers', 'Bollywood Choreographers', 'Music Video'] },
        wedding: { name: 'Wedding', icon: '💒', items: ['Wedding Choreographers', 'Sangeet Choreographers'] },
        reality: { name: 'Reality Shows', icon: '📺', items: ['Reality Show Choreographers', 'TV Show Choreographers'] },
        school: { name: 'School / College Events', icon: '🏫', items: ['School Choreographers', 'College Event Choreographers'] },
        fitness: { name: 'Fitness Dance', icon: '💪', items: ['Zumba', 'BollyFit', 'Dance Fitness'] },
        corporate: { name: 'Corporate Flashmob', icon: '🏢', items: ['Corporate Choreographers', 'Flashmob Organizers'] }
      }
    },
    cultural_artists: {
      name: 'Cultural Artists',
      icon: '🎭',
      subcategories: {
        traditional: { name: 'Traditional', icon: '🪘', items: ['Lavani', 'Nautanki', 'Tamasha'] },
        puppetry: { name: 'Puppetry', icon: '🎭', items: ['Glove Puppets', 'Shadow Puppets', 'String Puppets'] },
        tribal: { name: 'Tribal Artists', icon: '👤', items: ['Baiga', 'Gond', 'Bhil', 'Tribal Art'] },
        martial: { name: 'Martial Folk Arts', icon: '�', items: ['Martial Arts', 'Fighting Arts', 'Combat Sports'] }
      }
    },
    carnival_artists: {
      name: 'Carnival Artists',
      icon: '🎪',
      subcategories: {
        performance: { name: 'Performance', icon: '🎭', items: ['Stilt Walkers', 'Jugglers', 'Fire Performers'] },
        visual: { name: 'Visual', icon: '👤', items: ['Human Statues', 'Mime', 'Living Statues'] },
        comedy: { name: 'Comedy', icon: '😄', items: ['Clowns', 'Balloon Artists', 'Comedy Acts'] },
        acrobatic: { name: 'Acrobatic', icon: '🤸', items: ['Acrobats', 'Rope Walkers', 'Trapeze Artists'] }
      }
    },
    makeup_artists: {
      name: 'Makeup Artists',
      icon: '💄',
      subcategories: {
        bridal: { name: 'Bridal', icon: '💒', items: ['Bridal Makeup', 'Wedding Makeup', 'Traditional Bridal'] },
        fashion: { name: 'Fashion', icon: '👗', items: ['Fashion Makeup', 'Runway Makeup', 'Editorial Makeup'] },
        celebrity: { name: 'Celebrity', icon: '⭐', items: ['Celebrity Makeup', 'Red Carpet Makeup', 'TV Makeup'] },
        theatre: { name: 'Theatre / Film', icon: '🎬', items: ['Theatre Makeup', 'Film Makeup', 'Special Effects'] },
        sfx: { name: 'SFX', icon: '🎭', items: ['Special Effects', 'Prosthetic Makeup', 'Creature Makeup'] },
        hair: { name: 'Hair Stylists', icon: '💇', items: ['Hair Stylists', 'Hair Artists', 'Hair Designers'] }
      }
    },
    fitness_artists: {
      name: 'Fitness Artists',
      icon: '🏋️',
      subcategories: {
        zumba: { name: 'Zumba', icon: '💃', items: ['Zumba', 'Dance Fitness', 'Aerobics'] },
        yoga: { name: 'Yoga', icon: '🧘', items: ['Yoga', 'Meditation', 'Wellness'] },
        martial: { name: 'Martial Arts', icon: '🥋', items: ['Martial Arts', 'Karate', 'Taekwondo'] },
        pole: { name: 'Pole Fitness', icon: '🕺', items: ['Pole Dance', 'Pole Fitness', 'Aerial Fitness'] }
      }
    },
    painters: {
      name: 'Painters',
      icon: '🎨',
      subcategories: {
        traditional: { name: 'Traditional', icon: '🖼️', items: ['Oil', 'Watercolor', 'Acrylic'] },
        style: { name: 'Style', icon: '🎨', items: ['Realism', 'Abstract', 'Hyperrealism'] },
        modern: { name: 'Modern', icon: '🎨', items: ['Street', 'Graffiti', 'Digital', 'Mural'] }
      }
    },
    sketch_artists: {
      name: 'Sketch Artists',
      icon: '✏️',
      subcategories: {
        traditional: { name: 'Traditional', icon: '✏️', items: ['Pencil', 'Charcoal', 'Ink'] },
        creative: { name: 'Creative', icon: '🎨', items: ['Caricature', 'Comic', 'Anime'] },
        body: { name: 'Body Art', icon: '🎭', items: ['Tattoo Art', 'Body Painting', 'Henna'] },
        digital: { name: 'Digital', icon: '💻', items: ['Digital Art', '3D Art', 'NFT Art'] }
      }
    },
    rjs: {
      name: 'RJs',
      icon: '🎙️',
      subcategories: {
        fm: { name: 'FM RJs', icon: '📻', items: ['FM Radio', 'Music Radio', 'Entertainment Radio'] },
        digital: { name: 'Digital RJs', icon: '💻', items: ['Online Radio', 'Podcast Radio', 'Digital Radio'] },
        event: { name: 'Event RJs', icon: '🎤', items: ['Event RJs', 'Live Event Radio', 'Show RJs'] },
        storytelling: { name: 'Storytelling RJs', icon: '📖', items: ['Storytelling', 'Narrative Radio', 'Audio Stories'] }
      }
    },
    voice_artists: {
      name: 'Voice Artists',
      icon: '🎧',
      subcategories: {
        commercial: { name: 'Ads / Commercial', icon: '📺', items: ['Commercial Voice', 'Advertisement Voice', 'Jingle Voice'] },
        dubbing: { name: 'Dubbing', icon: '🎬', items: ['Film Dubbing', 'OTT Dubbing', 'Animation Dubbing'] },
        animation: { name: 'Animation Voices', icon: '🎭', items: ['Cartoon Voices', 'Animation Voice', 'Character Voice'] },
        audiobook: { name: 'Audiobooks / Podcast', icon: '🎧', items: ['Audiobook Narration', 'Podcast Hosting', 'Voice Acting'] },
        corporate: { name: 'IVR / Corporate', icon: '🏢', items: ['IVR Voice', 'Corporate Voice', 'Training Voice'] }
      }
    },
    writers: {
      name: 'Writers',
      icon: '✍️',
      subcategories: {
        poetry: { name: 'Poets', icon: '📜', items: ['Poets', 'Shayars', 'Poetry Writers'] },
        storytelling: { name: 'Storytellers', icon: '📖', items: ['Storytellers', 'Fiction Writers', 'Narrative Writers'] },
        script: { name: 'Script Writers', icon: '🎬', items: ['Script Writers', 'Screenplay Writers', 'Dialogue Writers'] },
        lyric: { name: 'Lyricists', icon: '🎵', items: ['Lyricists', 'Song Writers', 'Music Writers'] },
        content: { name: 'Content Writers', icon: '📝', items: ['Content Writers', 'Blog Writers', 'Copy Writers'] }
      }
    },
    djs: {
      name: 'DJs',
      icon: '🎧',
      subcategories: {
        wedding: { name: 'Wedding DJs', icon: '💒', items: ['Wedding DJs', 'Event DJs', 'Party DJs'] },
        club: { name: 'Club DJs', icon: '🎵', items: ['Club DJs', 'Nightclub DJs', 'Bar DJs'] },
        edm: { name: 'EDM / Techno', icon: '🎧', items: ['EDM DJs', 'Techno DJs', 'Electronic DJs'] },
        bollywood: { name: 'Bollywood DJs', icon: '🎬', items: ['Bollywood DJs', 'Desi DJs', 'Indian Music DJs'] },
        fusion: { name: 'DJ + Instrument Fusion', icon: '🎸', items: ['Live DJ', 'DJ Musicians', 'Instrument Fusion'] }
      }
    },
    wellness_artists: {
      name: 'Wellness Artists',
      icon: '🧘',
      subcategories: {
        meditation: { name: 'Meditation', icon: '🧘', items: ['Meditation', 'Mantra', 'Mindfulness'] },
        healing: { name: 'Sound Healing', icon: '🎵', items: ['Sound Healing', 'Music Therapy', 'Vibrational Healing'] },
        reiki: { name: 'Reiki Healing', icon: '✋', items: ['Reiki', 'Energy Healing', 'Spiritual Healing'] },
        spiritual: { name: 'Spiritual Storytelling', icon: '📖', items: ['Spiritual Storytelling', 'Motivational Speaking', 'Inspirational Talks'] }
      }
    },
    fashion_artists: {
      name: 'Fashion Artists',
      icon: '👗',
      subcategories: {
        design: { name: 'Fashion Designers', icon: '👗', items: ['Fashion Designers', 'Clothing Designers', 'Apparel Designers'] },
        costume: { name: 'Costume Designers', icon: '🎭', items: ['Costume Designers', 'Theatre Costumes', 'Film Costumes'] },
        styling: { name: 'Stylists', icon: '💇', items: ['Fashion Stylists', 'Personal Stylists', 'Wardrobe Stylists'] },
        jewelry: { name: 'Jewellery Designers', icon: '💍', items: ['Jewellery Designers', 'Accessory Designers', 'Ornament Designers'] }
      }
    },
    culinary_artists: {
      name: 'Culinary Artists',
      icon: '🍰',
      subcategories: {
        cake: { name: 'Cake Artists', icon: '🎂', items: ['Cake Artists', 'Cake Designers', 'Pastry Chefs'] },
        chocolate: { name: 'Chocolate Artists', icon: '🍫', items: ['Chocolate Artists', 'Chocolatiers', 'Confectionery'] },
        carving: { name: 'Food Carving', icon: '🔪', items: ['Food Carving', 'Fruit Carving', 'Ice Carving'] }
      }
    },
    children_artists: {
      name: 'Children Artists',
      icon: '🧸',
      subcategories: {
        entertainment: { name: 'Kids Entertainers', icon: '🤡', items: ['Kids Entertainers', 'Children Shows', 'Kids Parties'] },
        puppet: { name: 'Puppet Shows', icon: '🎭', items: ['Puppet Shows', 'Puppeteers', 'Marionette Shows'] },
        magic: { name: 'Magic Shows', icon: '🎩', items: ['Magic Shows', 'Kids Magic', 'Family Magic'] },
        storytelling: { name: 'Storytelling', icon: '📖', items: ['Storytelling', 'Kids Stories', 'Educational Stories'] },
        diy: { name: 'DIY Workshops', icon: '🛠️', items: ['DIY Workshops', 'Craft Workshops', 'Kids Activities'] }
      }
    },
    special_artists: {
      name: 'Special Artists',
      icon: '🌟',
      subcategories: {
        traditional: { name: 'Traditional', icon: '🎨', items: ['Rangoli', 'Mehendi', 'Henna Art'] },
        sand: { name: 'Sand Art', icon: '🏖️', items: ['Sand Art', 'Sand Sculptures', 'Beach Art'] },
        calligraphy: { name: 'Calligraphy', icon: '✍️', items: ['Calligraphy', 'Hand Lettering', 'Typography'] },
        ice: { name: 'Ice Sculptors', icon: '🧊', items: ['Ice Sculptors', 'Ice Carving', 'Ice Art'] }
      }
    },
    visual_tech_artists: {
      name: 'Visual Tech Artists',
      icon: '💡',
      subcategories: {
        laser: { name: 'Laser Shows', icon: '🔴', items: ['Laser Shows', 'Light Shows', 'Visual Effects'] },
        hologram: { name: 'Hologram Shows', icon: '👤', items: ['Hologram Shows', '3D Shows', 'Projection Shows'] },
        led: { name: 'LED Performers', icon: '💡', items: ['LED Performers', 'Light Artists', 'Visual Artists'] },
        mapping: { name: 'Video Mapping', icon: '📹', items: ['Video Mapping', 'Projection Mapping', 'Visual Mapping'] }
      }
    },
    circus_artists: {
      name: 'Circus Artists',
      icon: '🎪',
      subcategories: {
        aerial: { name: 'Aerial', icon: '🎪', items: ['Trapeze', 'Aerial Silks', 'Aerial Hoop'] },
        fire: { name: 'Fire', icon: '🔥', items: ['Fire Breathers', 'Fire Eaters', 'Fire Performers'] },
        knife: { name: 'Knife', icon: '🔪', items: ['Knife Throwers', 'Knife Jugglers', 'Blade Artists'] },
        contortion: { name: 'Contortionists', icon: '🤸', items: ['Contortionists', 'Flexibility Artists', 'Body Artists'] }
      }
    },
    actors: {
      name: 'Actors',
      icon: '🎬',
      subcategories: {
        theatre: { name: 'Theatre', icon: '🎭', items: ['Theatre Actors', 'Stage Actors', 'Live Theatre'] },
        film: { name: 'Film / TV', icon: '📺', items: ['Film Actors', 'TV Actors', 'Web Series'] },
        voice: { name: 'Voice Acting', icon: '🎤', items: ['Voice Acting', 'Dubbing Artists', 'Animation Voice'] }
      }
    },
    magicians: {
      name: 'Magicians',
      icon: '🎩',
      subcategories: {
        stage: { name: 'Stage Magic', icon: '🎭', items: ['Stage Magicians', 'Live Magic', 'Performance Magic'] },
        illusion: { name: 'Illusionists', icon: '👁️', items: ['Illusionists', 'Mind Readers', 'Mentalists'] },
        kids: { name: 'Kids Magicians', icon: '🤡', items: ['Kids Magicians', 'Family Magic', 'Children Magic'] }
      }
    },
    digital_artists: {
      name: 'Digital Artists',
      icon: '💻',
      subcategories: {
        nft: { name: 'NFT Artists', icon: '🎨', items: ['NFT Artists', 'Crypto Art', 'Digital Collectibles'] },
        ar_vr: { name: 'AR/VR Artists', icon: '🥽', items: ['AR Artists', 'VR Artists', 'Mixed Reality'] },
        drone: { name: 'Drone Shows', icon: '🚁', items: ['Drone Shows', 'Aerial Photography', 'Drone Art'] },
        installation: { name: 'Installation Artists', icon: '🎨', items: ['Installation Artists', '3D Installations', 'Interactive Art'] }
      }
    },
    musicians: {
      name: 'Musicians',
      icon: '🎸',
      subcategories: {
        classical: { name: 'Classical Musicians', icon: '🎵', items: ['Classical Guitar', 'Classical Piano', 'Classical Violin', 'Classical Flute'] },
        modern: { name: 'Modern Musicians', icon: '🎸', items: ['Rock Guitar', 'Pop Piano', 'Jazz Saxophone', 'Electronic Keyboard'] },
        traditional: { name: 'Traditional Musicians', icon: '🪘', items: ['Dholak', 'Tabla', 'Sitar', 'Flute', 'Harmonium'] },
        session: { name: 'Session Musicians', icon: '🎵', items: ['Studio Musicians', 'Live Session Players', 'Recording Artists'] }
      }
    },
    photographers: {
      name: 'Photographers',
      icon: '📷',
      subcategories: {
        wedding: { name: 'Wedding Photography', icon: '💒', items: ['Wedding Shoots', 'Pre-Wedding', 'Candid Wedding', 'Traditional Wedding'] },
        fashion: { name: 'Fashion Photography', icon: '👗', items: ['Fashion Shoots', 'Portfolio', 'Magazine', 'Runway'] },
        product: { name: 'Product Photography', icon: '📦', items: ['E-commerce', 'Product Catalogs', 'Food Photography', 'Still Life'] },
        portrait: { name: 'Portrait Photography', icon: '👤', items: ['Studio Portraits', 'Outdoor Portraits', 'Corporate Headshots', 'Family Portraits'] },
        event: { name: 'Event Photography', icon: '🎉', items: ['Corporate Events', 'Birthday Parties', 'Concerts', 'Festivals'] }
      }
    },
    videographers: {
      name: 'Videographers',
      icon: '🎥',
      subcategories: {
        wedding: { name: 'Wedding Videography', icon: '💒', items: ['Wedding Films', 'Cinematic Wedding', 'Traditional Wedding', 'Highlight Reels'] },
        corporate: { name: 'Corporate Videography', icon: '🏢', items: ['Corporate Films', 'Training Videos', 'Promotional Videos', 'Event Coverage'] },
        music: { name: 'Music Videos', icon: '🎵', items: ['Music Video Production', 'Live Performance', 'Behind the Scenes', 'Teaser Videos'] },
        documentary: { name: 'Documentary', icon: '📹', items: ['Documentary Films', 'Short Films', 'Travel Videos', 'Storytelling'] }
      }
    },
    hair_stylists: {
      name: 'Hair Stylists',
      icon: '💇',
      subcategories: {
        bridal: { name: 'Bridal Hair', icon: '💒', items: ['Bridal Hairstyles', 'Wedding Hair', 'Traditional Bridal', 'Modern Bridal'] },
        fashion: { name: 'Fashion Hair', icon: '👗', items: ['Runway Hair', 'Fashion Shoots', 'Editorial Hair', 'Avant Garde'] },
        salon: { name: 'Salon Services', icon: '💇', items: ['Haircuts', 'Hair Coloring', 'Hair Treatments', 'Hair Styling'] },
        creative: { name: 'Creative Hair', icon: '🎨', items: ['Creative Color', 'Hair Art', 'Special Effects Hair', 'Fantasy Hair'] }
      }
    },
    comedians: {
      name: 'Comedians',
      icon: '😄',
      subcategories: {
        standup: { name: 'Stand-up Comedy', icon: '🎤', items: ['Stand-up Comedy', 'Open Mic', 'Comedy Clubs', 'Comedy Specials'] },
        sketch: { name: 'Sketch Comedy', icon: '📺', items: ['Sketch Shows', 'Comedy Series', 'Web Series', 'Short Films'] },
        improv: { name: 'Improvisation', icon: '🎭', items: ['Improv Comedy', 'Improv Shows', 'Spontaneous Comedy', 'Interactive Comedy'] },
        digital: { name: 'Digital Comedy', icon: '📱', items: ['Social Media Comedy', 'Memes', 'Short Videos', 'Online Content'] }
      }
    },
    models: {
      name: 'Models',
      icon: '👤',
      subcategories: {
        fashion: { name: 'Fashion Modeling', icon: '👗', items: ['Runway Models', 'Fashion Shows', 'Magazine Covers', 'Fashion Campaigns'] },
        commercial: { name: 'Commercial Modeling', icon: '📺', items: ['TV Commercials', 'Print Ads', 'Brand Ambassador', 'Product Modeling'] },
        fitness: { name: 'Fitness Modeling', icon: '💪', items: ['Fitness Models', 'Athletic Wear', 'Gym Brands', 'Health Products'] },
        plus_size: { name: 'Plus Size Modeling', icon: '🌟', items: ['Plus Size Fashion', 'Body Positivity', 'Inclusive Brands', 'Plus Size Campaigns'] }
      }
    },
    fashion_designers: {
      name: 'Fashion Designers',
      icon: '👗',
      subcategories: {
        bridal: { name: 'Bridal Wear', icon: '💒', items: ['Wedding Dresses', 'Bridal Collections', 'Traditional Bridal', 'Modern Bridal'] },
        casual: { name: 'Casual Wear', icon: '👕', items: ['Daily Wear', 'Street Style', 'Casual Collections', 'Ready to Wear'] },
        ethnic: { name: 'Ethnic Wear', icon: '🪘', items: ['Traditional Wear', 'Cultural Outfits', 'Fusion Wear', 'Regional Styles'] },
        luxury: { name: 'Luxury Fashion', icon: '✨', items: ['Haute Couture', 'Luxury Brands', 'Designer Wear', 'High Fashion'] }
      }
    },
    content_creators: {
      name: 'Content Creators',
      icon: '📱',
      subcategories: {
        youtube: { name: 'YouTube Creators', icon: '📺', items: ['Vloggers', 'Educational Content', 'Entertainment', 'Tutorial Videos'] },
        instagram: { name: 'Instagram Creators', icon: '📷', items: ['Reels Creators', 'Lifestyle Content', 'Travel Content', 'Food Content'] },
        blog: { name: 'Bloggers', icon: '📝', items: ['Travel Bloggers', 'Food Bloggers', 'Fashion Bloggers', 'Tech Bloggers'] },
        podcast: { name: 'Podcasters', icon: '🎙️', items: ['Interview Podcasts', 'Storytelling Podcasts', 'Educational Podcasts', 'Entertainment Podcasts'] }
      }
    },
    influencers: {
      name: 'Influencers',
      icon: '🌟',
      subcategories: {
        fashion: { name: 'Fashion Influencers', icon: '👗', items: ['Fashion Bloggers', 'Style Influencers', 'Outfit Ideas', 'Fashion Trends'] },
        lifestyle: { name: 'Lifestyle Influencers', icon: '🌟', items: ['Lifestyle Content', 'Daily Routine', 'Home Decor', 'Lifestyle Tips'] },
        travel: { name: 'Travel Influencers', icon: '✈️', items: ['Travel Bloggers', 'Destination Guides', 'Travel Tips', 'Adventure Content'] },
        fitness: { name: 'Fitness Influencers', icon: '💪', items: ['Workout Content', 'Fitness Tips', 'Nutrition', 'Wellness'] }
      }
    },
    tattoo_artists: {
      name: 'Tattoo Artists',
      icon: '🎨',
      subcategories: {
        traditional: { name: 'Traditional Tattoo', icon: '🎨', items: ['Traditional Tattoos', 'Old School', 'American Traditional', 'Tribal Tattoos'] },
        modern: { name: 'Modern Tattoo', icon: '🎭', items: ['Modern Tattoos', 'Contemporary', 'Illustrative', 'Geometric'] },
        realistic: { name: 'Realistic Tattoo', icon: '👤', items: ['Realistic Portraits', '3D Tattoos', 'Hyperrealistic', 'Black & Gray'] },
        watercolor: { name: 'Watercolor Tattoo', icon: '🎨', items: ['Watercolor Tattoos', 'Brush Style', 'Colorful Tattoos', 'Artistic Tattoos'] }
      }
    },
    graphic_designers: {
      name: 'Graphic Designers',
      icon: '🖼️',
      subcategories: {
        branding: { name: 'Branding Design', icon: '🏷️', items: ['Logo Design', 'Brand Identity', 'Business Cards', 'Brand Guidelines'] },
        web: { name: 'Web Design', icon: '💻', items: ['Website Design', 'UI/UX Design', 'Mobile Apps', 'Landing Pages'] },
        print: { name: 'Print Design', icon: '📄', items: ['Brochures', 'Flyers', 'Posters', 'Magazine Layouts'] },
        social: { name: 'Social Media Design', icon: '📱', items: ['Social Media Posts', 'Instagram Stories', 'Facebook Covers', 'Twitter Headers'] }
      }
    },
    voice_over_artists: {
      name: 'Voice Over Artists',
      icon: '🎤',
      subcategories: {
        commercial: { name: 'Commercial Voice', icon: '📺', items: ['TV Commercials', 'Radio Ads', 'Jingle Voice', 'Brand Voice'] },
        animation: { name: 'Animation Voice', icon: '🎭', items: ['Cartoon Voices', 'Character Voices', 'Dubbing', 'Video Games'] },
        narration: { name: 'Narration', icon: '📖', items: ['Documentary Narration', 'Audiobooks', 'E-learning', 'Training Videos'] },
        corporate: { name: 'Corporate Voice', icon: '🏢', items: ['Corporate Videos', 'Training Modules', 'IVR Systems', 'Presentations'] }
      }
    },
    poets: {
      name: 'Poets',
      icon: '📜',
      subcategories: {
        traditional: { name: 'Traditional Poetry', icon: '📜', items: ['Classical Poetry', 'Shayari', 'Ghazals', 'Folk Poetry'] },
        modern: { name: 'Modern Poetry', icon: '✍️', items: ['Modern Poetry', 'Spoken Word', 'Slam Poetry', 'Performance Poetry'] },
        romantic: { name: 'Romantic Poetry', icon: '❤️', items: ['Love Poems', 'Romantic Shayari', 'Couplets', 'Romantic Verses'] },
        motivational: { name: 'Motivational Poetry', icon: '🌟', items: ['Inspirational Poetry', 'Motivational Verses', 'Life Poetry', 'Uplifting Words'] }
      }
    },
    standup_artists: {
      name: 'Stand-up Artists',
      icon: '🎤',
      subcategories: {
        observational: { name: 'Observational Comedy', icon: '👀', items: ['Observational Humor', 'Everyday Life', 'Social Commentary', 'Relatable Comedy'] },
        satire: { name: 'Satire Comedy', icon: '😏', items: ['Satirical Comedy', 'Political Satire', 'Social Satire', 'Dark Humor'] },
        clean: { name: 'Clean Comedy', icon: '😄', items: ['Family Friendly', 'Clean Humor', 'All Ages', 'Wholesome Comedy'] },
        alternative: { name: 'Alternative Comedy', icon: '🎭', items: ['Alternative Comedy', 'Experimental', 'Improvisational', 'Niche Humor'] }
      }
    },
    music_producers: {
      name: 'Music Producers',
      icon: '🎵',
      subcategories: {
        electronic: { name: 'Electronic Music', icon: '🎧', items: ['EDM Production', 'Techno', 'House Music', 'Trance', 'Dubstep'] },
        hip_hop: { name: 'Hip-Hop Production', icon: '🎤', items: ['Hip-Hop Beats', 'Trap Music', 'R&B Production', 'Urban Music'] },
        bollywood: { name: 'Bollywood Music', icon: '🎬', items: ['Bollywood Production', 'Film Music', 'Indian Pop', 'Fusion Music'] },
        classical: { name: 'Classical Production', icon: '🎵', items: ['Classical Arrangement', 'Orchestral Production', 'Classical Recording', 'Traditional Music'] }
      }
    }
  };

  const artistCategories = [
    { id: 'singers', name: 'Singer', icon: '🎤' },
    { id: 'musicians', name: 'Musician', icon: '🎸' },
    { id: 'dancers', name: 'Dancer', icon: '💃' },
    { id: 'djs', name: 'DJ', icon: '🎧' },
    { id: 'photographers', name: 'Photographer', icon: '📷' },
    { id: 'videographers', name: 'Videographer', icon: '🎥' },
    { id: 'makeup_artists', name: 'Makeup Artist', icon: '💄' },
    { id: 'hair_stylists', name: 'Hair Stylist', icon: '💇' },
    { id: 'fashion_designers', name: 'Fashion Designer', icon: '👗' },
    { id: 'models', name: 'Model', icon: '👤' },
    { id: 'actors', name: 'Actor', icon: '🎬' },
    { id: 'comedians', name: 'Comedian', icon: '😄' },
    { id: 'anchors', name: 'Anchor / Host', icon: '�️' },
    { id: 'content_creators', name: 'Content Creator', icon: '📱' },
    { id: 'influencers', name: 'Influencer', icon: '🌟' },
    { id: 'painters', name: 'Painter', icon: '🎨' },
    { id: 'sketch_artists', name: 'Sketch Artist', icon: '✏️' },
    { id: 'tattoo_artists', name: 'Tattoo Artist', icon: '�' },
    { id: 'graphic_designers', name: 'Graphic Designer', icon: '🖼️' },
    { id: 'digital_artists', name: 'Digital Artist', icon: '🎨' },
    { id: 'voice_over_artists', name: 'Voice Over Artist', icon: '🎤' },
    { id: 'writers', name: 'Writer', icon: '✍️' },
    { id: 'poets', name: 'Poet', icon: '📜' },
    { id: 'magicians', name: 'Magician', icon: '🎩' },
    { id: 'standup_artists', name: 'Stand-up Artist', icon: '�' },
    { id: 'choreographers', name: 'Choreographer', icon: '🕺' },
    { id: 'music_producers', name: 'Music Producer', icon: '🎵' },
    { id: 'instrumentalists', name: 'Instrumentalist', icon: '🎵' }
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setError('');
  };

  const toggleCategory = (categoryId) => {
    setFormData(prev => {
      const currentCategories = prev.categories || [];
      if (currentCategories.includes(categoryId)) {
        const newCategories = currentCategories.filter(id => id !== categoryId);
        // Also remove subcategories belonging to this category
        const categoryData = allCategoriesData[categoryId];
        if (categoryData && categoryData.subcategories) {
          const allItems = [];
          Object.values(categoryData.subcategories).forEach(s => allItems.push(...s.items));
          const currentSubcategories = prev.subcategories || [];
          const newSubcategories = currentSubcategories.filter(item => !allItems.includes(item));
          return { ...prev, categories: newCategories, subcategories: newSubcategories };
        }
        return { ...prev, categories: newCategories };
      }
      if (currentCategories.length >= 3) {
        setError('Maximum 3 categories allowed');
        return prev;
      }
      return { ...prev, categories: [...currentCategories, categoryId] };
    });
  };

  const toggleSubcategory = (subName) => {
    setFormData(prev => {
      const currentSubcategories = prev.subcategories || [];
      if (currentSubcategories.includes(subName)) {
        return { ...prev, subcategories: currentSubcategories.filter(name => name !== subName) };
      }
      if (currentSubcategories.length >= 6) {
        setError('Maximum 6 sub-categories allowed');
        return prev;
      }
      return { ...prev, subcategories: [...currentSubcategories, subName] };
    });
  };

  const validateForm = () => {
    setError('');
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Please fill all required personal information fields');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.profileType) {
      setError('Please select a profile type');
      return false;
    }
    if (formData.profileType === 'artist' && !formData.artistType) {
      setError('Please select your artist type');
      return false;
    }
    if (!formData.categories || formData.categories.length === 0) {
      setError('Please select at least one category');
      return false;
    }
    return true;
  };


  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...payload } = formData;

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';
      const response = await fetch(`${API_BASE_URL}/api/artist/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Registration successful! Your application is under review.');
        setTimeout(() => {
          navigate('auth');
        }, 3000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="pt-8 pb-16 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Home Button */}
        <div className="mb-3">
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2 text-textSecondary hover:text-orange-500 transition-colors font-medium w-fit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        <div className="bg-surface rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* Left Column: Personal Information */}
            <div className="lg:col-span-6 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-border flex flex-col">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-textPrimary">Artist Registration</h1>
                  <p className="text-textSecondary text-sm">Fill your basic details</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col space-y-8">
                <div>
                  <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Personal Information</label>
                  <div className="space-y-4">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-background border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all placeholder-black text-black text-lg"
                      />
                    </div>

                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-background border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all placeholder-black text-black text-lg"
                      />
                    </div>

                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                      <input
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-background border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all placeholder-black text-black text-lg"
                      />
                    </div>

                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-background border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all placeholder-black text-black text-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-textSecondary hover:text-orange-500 transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-background border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all placeholder-black text-black text-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-textSecondary hover:text-orange-500 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>


                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-error text-sm animate-in fade-in duration-300">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-success text-sm animate-in fade-in duration-300">
                    {success}
                  </div>
                )}

              </div>
            </div>

            {/* Right Column: Category & Profile Details */}
            <div className="lg:col-span-6 p-8 lg:p-12 bg-background/50 flex flex-col">
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-xl font-bold text-textPrimary mb-2">Portfolio Details</h2>
                <p className="text-textSecondary text-sm">Help us understand your talent and social presence</p>
              </div>

              <div className="space-y-8">
                {/* Profile Type & Artist Type Section */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1">Profile Type *</label>
                  <div className="flex gap-3">
                    {['artist', 'influencer'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          handleInputChange('profileType', type);
                          if (type === 'influencer') handleInputChange('artistType', '');
                        }}
                        className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${formData.profileType === type
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50'
                          }`}
                      >
                        {type === 'artist' ? '🎨 Artist' : '🌟 Influencer'}
                      </button>
                    ))}
                  </div>

                  {formData.profileType === 'artist' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1">Artist Type *</label>
                      <div className="relative">
                        <select
                          value={formData.artistType}
                          onChange={(e) => handleInputChange('artistType', e.target.value)}
                          className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-black text-lg appearance-none cursor-pointer"
                        >
                          <option value="">Select Artist Type</option>
                          <option value="solo">Solo Artist</option>
                          <option value="duo">Duo</option>
                          <option value="trio">Trio</option>
                          <option value="group">Group / Band</option>
                        </select>
                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Artist Categories Section */}
                <div>

                  <div
                    onClick={() => setShowCategoryPopup(true)}
                    className="w-full min-h-[60px] p-3 bg-surface border border-border rounded-2xl flex flex-nowrap items-center gap-2 cursor-pointer hover:border-orange-500 hover:shadow-sm transition-all text-left overflow-x-auto custom-scrollbar hide-scrollbar"
                  >
                    {!formData.categories || formData.categories.length === 0 ? (
                      <span className="px-3 text-black text-base">Artist Categories (Select up to 3)</span>
                    ) : (
                      formData.categories.map(catId => {
                        const category = artistCategories.find(c => c.id === catId);
                        return (
                          <div
                            key={catId}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-xl text-sm font-bold border border-orange-200 animate-in zoom-in duration-300"
                          >
                            <span className="whitespace-nowrap">{category?.icon}</span>
                            <span className="whitespace-nowrap">{category?.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(catId);
                              }}
                              className="w-4 h-4 rounded-full bg-orange-200 flex items-center justify-center hover:bg-orange-300 transition-colors"
                            >
                              <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Artist Sub-Categories Section */}
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">

                  <div
                    onClick={() => formData.categories && formData.categories.length > 0 && setShowSubcategoryPopup(true)}
                    className={`w-full min-h-[60px] p-3 bg-surface border border-border rounded-2xl flex flex-nowrap items-center gap-2 transition-all text-left overflow-x-auto custom-scrollbar hide-scrollbar ${!formData.categories || formData.categories.length === 0
                      ? 'opacity-50 cursor-not-allowed bg-background'
                      : 'cursor-pointer hover:border-orange-500 hover:shadow-sm'
                      }`}
                  >
                    {!formData.categories || formData.categories.length === 0 ? (
                      <span className="px-3 text-black text-base whitespace-nowrap">Artist Sub-Categories (Select up to 6)</span>
                    ) : !formData.subcategories || formData.subcategories.length === 0 ? (
                      <span className="px-3 text-black text-base whitespace-nowrap">Artist Sub-Categories (Select up to 6)</span>
                    ) : (
                      formData.subcategories.map(subName => (
                        <div
                          key={subName}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-xl text-sm font-bold border border-violet-200 animate-in zoom-in duration-300"
                        >
                          <span className="whitespace-nowrap">{subName}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubcategory(subName);
                            }}
                            className="w-4 h-4 rounded-full bg-violet-200 flex items-center justify-center hover:bg-violet-300 transition-colors"
                          >
                            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Location & Social Links Section */}
                <div className="pt-4 border-t border-border space-y-8">
                  <div>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary group-focus-within:text-orange-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-black text-black text-lg shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary group-focus-within:text-orange-500 transition-colors">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        </span>
                        <input
                          type="url"
                          placeholder="YouTube Link"
                          value={formData.socialLinks.youtube}
                          onChange={(e) => handleInputChange('socialLinks.youtube', e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-black text-black text-lg shadow-sm"
                        />
                      </div>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary group-focus-within:text-orange-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" /><path strokeWidth="2" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
                          </svg>
                        </span>
                        <input
                          type="url"
                          placeholder="Instagram Link"
                          value={formData.socialLinks.instagram}
                          onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-black text-black text-lg shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="p-8 lg:p-12 border-t border-border flex justify-center bg-surface">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full max-w-md py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Registering...
                </span>
              ) : 'Register'}
            </button>
          </div>
        </div>
      </div>
      {/* Category Selection Modal */}
      {showCategoryPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-200 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-textPrimary">Choose Categories</h2>
                  <p className="text-textSecondary text-sm">Select up to 3 talents to showcase</p>
                </div>
                <button
                  onClick={() => setShowCategoryPopup(false)}
                  className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Filter */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search categories (e.g. Singer, Painter...)"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all placeholder-gray-400 text-gray-700"
                />
              </div>
            </div>

            {/* Modal Body: Scrollable Grid */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {artistCategories
                  .filter(cat => cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()))
                  .map(category => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`relative p-5 rounded-[24px] border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${formData.categories && formData.categories.includes(category.id)
                        ? 'border-orange-500 bg-orange-50 shadow-md scale-[1.02]'
                        : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50 hover:shadow-lg hover:scale-[1.02]'
                        }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-1 transition-all ${formData.categories && formData.categories.includes(category.id) ? 'bg-orange-200 scale-110' : 'bg-gray-100'
                        }`}>
                        {category.icon}
                      </div>
                      <span className={`text-xs font-bold text-center leading-tight ${formData.categories && formData.categories.includes(category.id) ? 'text-orange-600' : 'text-gray-600'}`}>
                        {category.name}
                      </span>
                      {formData.categories && formData.categories.includes(category.id) && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-200 scale-110 animate-in zoom-in duration-300">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                {artistCategories.filter(cat => cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase())).length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-500">
                    <p>No categories found matching "{categorySearchQuery}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm font-bold text-gray-600">
                <span className={formData.categories && formData.categories.length === 3 ? 'text-orange-500' : 'text-gray-600'}>
                  {formData.categories ? formData.categories.length : 0}
                </span>
                /3 Selected
              </div>
              <button
                onClick={() => setShowCategoryPopup(false)}
                className="px-10 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95"
              >
                Done Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Category Selection Modal */}
      {showSubcategoryPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-200 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-textPrimary">Choose Sub-Categories</h2>
                  <p className="text-textSecondary text-sm">Select up to 6 specific styles</p>
                </div>
                <button
                  onClick={() => setShowSubcategoryPopup(false)}
                  className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Filter */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search sub-categories..."
                  value={subcategorySearchQuery}
                  onChange={(e) => setSubcategorySearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all placeholder-gray-400 text-gray-700"
                />
              </div>
            </div>

            {/* Modal Body: Scrollable Grid */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="flex flex-wrap gap-3">
                {(formData.categories || []).flatMap(catId => {
                  const catData = allCategoriesData[catId];
                  if (!catData) return [];
                  const allSubItems = [];
                  Object.values(catData.subcategories).forEach(s => allSubItems.push(...s.items));
                  return allSubItems;
                })
                  .filter(item => item.toLowerCase().includes(subcategorySearchQuery.toLowerCase()))
                  .map(item => (
                    <button
                      key={item}
                      onClick={() => toggleSubcategory(item)}
                      className={`relative px-6 py-3 rounded-2xl border-2 text-sm font-bold transition-all duration-300 ${formData.subcategories && formData.subcategories.includes(item)
                        ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-md scale-[1.05]'
                        : 'border-gray-100 bg-white text-gray-600 hover:border-violet-200 hover:bg-violet-50 hover:shadow-lg hover:scale-[1.05]'
                        }`}
                    >
                      {item}
                      {formData.subcategories && formData.subcategories.includes(item) && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center shadow-lg shadow-violet-200 animate-in zoom-in duration-300">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm font-bold text-gray-600">
                <span className={formData.subcategories && formData.subcategories.length === 6 ? 'text-violet-500' : 'text-gray-600'}>
                  {formData.subcategories ? formData.subcategories.length : 0}
                </span>
                /6 Selected
              </div>
              <button
                onClick={() => setShowSubcategoryPopup(false)}
                className="px-10 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95"
              >
                Done Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistRegistrationPage;
