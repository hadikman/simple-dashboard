import { type Document } from 'mongodb'

import {
  CollectionConfig,
  CollectionName,
  COLLECTIONS,
} from './mongo-manger.types'

const BRANDS_VALIDATOR: Document = {
  $jsonSchema: {
    bsonType: 'object',
    title: 'brands',
    required: ['name', 'slug', 'created_at'],
    properties: {
      schema_version: {
        bsonType: ['double', 'int', 'decimal'],
      },
      name: {
        bsonType: 'string',
        description: 'Must be a string and is required',
      },
      slug: {
        bsonType: 'string',
        description: 'Must be a string and is required',
      },
      description: {
        bsonType: 'string',
      },
      categories: {
        bsonType: 'array',
        items: {
          bsonType: 'objectId',
        },
      },
      logo: {
        bsonType: 'object',
        title: 'object',
        properties: {
          src: {
            bsonType: 'string',
          },
          alt: {
            bsonType: 'string',
          },
        },
      },
      website: {
        bsonType: 'string',
      },
      email: {
        bsonType: 'string',
      },
      phone: {
        bsonType: 'string',
      },
      stats: {
        bsonType: 'object',
        title: 'object',
        properties: {
          product_count: {
            bsonType: 'int',
          },
          total_sales: {
            bsonType: ['int', 'double'],
          },
          average_rating: {
            bsonType: ['int', 'double'],
          },
        },
      },
      created_at: {
        bsonType: 'date',
        description: 'Must be a date and is required',
      },
      updated_at: {
        bsonType: ['date', 'null'],
      },
    },
  },
}

const CATEGORY_VALIDATOR: Document = {
  $jsonSchema: {
    bsonType: 'object',
    title: 'category',
    required: ['category_group', 'name'],
    properties: {
      category_group: {
        enum: ['posts', 'products'],
        description: 'Must be a "posts"/"products" and is required',
      },
      name: {
        bsonType: 'string',
        description: 'Must be a string and is required',
      },
      children: {
        bsonType: 'array',
        items: {
          bsonType: 'string',
        },
      },
    },
  },
}

const FEATURES_VALIDATOR: Document = {
  $jsonSchema: {
    bsonType: 'object',
    title: 'features',
    required: ['name', 'slug', 'status'],
    properties: {
      schema_version: {
        bsonType: ['double', 'int', 'decimal'],
      },
      name: {
        bsonType: 'string',
      },
      slug: {
        bsonType: 'string',
      },
      description: {
        bsonType: 'string',
      },
      type: {
        bsonType: 'string',
      },
      category: {
        bsonType: 'string',
      },
      values: {
        bsonType: 'array',
        items: {
          title: 'object',
          properties: {
            id: {
              bsonType: 'int',
            },
            value: {
              bsonType: 'string',
            },
          },
        },
      },
      is_required: {
        bsonType: 'bool',
      },
      display_order: {
        bsonType: 'int',
      },
      status: {
        enum: ['active', 'inactive'],
        description: 'Must be a "active"/"inactive" and is required',
      },
      applicable_category_id: {
        bsonType: ['objectId', 'null'],
      },
      applicable_category_name: {
        bsonType: 'string',
      },
      created_at: {
        bsonType: 'date',
      },
      updated_at: {
        bsonType: ['date', 'null'],
      },
    },
  },
}

const GUARANTEES_VALIDATOR: Document = {
  $jsonSchema: {
    bsonType: 'object',
    title: 'guarantees',
    required: [
      'name',
      'slug',
      'duration',
      'status',
      'target_items',
      'created_at',
    ],
    properties: {
      schema_version: {
        bsonType: ['double', 'int', 'decimal'],
      },
      name: {
        bsonType: 'string',
        description: 'Must be a unique string and is required',
      },
      slug: {
        bsonType: 'string',
        description: 'Must be a unique string and is required',
      },
      brand_id: {
        bsonType: ['objectId', 'null'],
      },
      brand_name: {
        bsonType: 'string',
      },
      description: {
        bsonType: 'string',
      },
      duration: {
        bsonType: 'string',
        description: 'Must be a string and is required',
      },
      extra_price: {
        bsonType: ['double', 'int'],
      },
      status: {
        enum: ['active', 'inactive'],
        description: 'Must be a "active"/"inactive" and is required',
      },
      target_items: {
        bsonType: 'array',
        items: {
          title: 'object',
          properties: {
            product_id: {
              bsonType: 'objectId',
            },
            product_name: {
              bsonType: 'string',
            },
            category_id: {
              bsonType: ['objectId', 'null'],
            },
            category_name: {
              bsonType: 'string',
            },
            price_id: {
              bsonType: 'string',
            },
            price_name: {
              bsonType: 'string',
            },
          },
        },
        description: 'Must be an array of prices object and is required',
      },
      extra_duration: {
        bsonType: 'array',
        items: {
          title: 'object',
          properties: {
            id: {
              bsonType: 'string',
            },
            duration: {
              bsonType: 'string',
            },
            price: {
              bsonType: ['double', 'int'],
            },
          },
        },
      },
      created_at: {
        bsonType: 'date',
        description: 'Must be a date and is required',
      },
      updated_at: {
        bsonType: ['date', 'null'],
      },
    },
  },
}

const OFFERS_VALIDATOR: Document = {
  $jsonSchema: {
    bsonType: 'object',
    title: 'offers',
    required: [
      'name',
      'slug',
      'discount',
      'offer_start',
      'offer_end',
      'status',
      'target_items',
      'created_at',
    ],
    properties: {
      schema_version: {
        bsonType: ['double', 'int', 'decimal'],
      },
      name: {
        bsonType: 'string',
        description: 'Must be a unique string and is required',
      },
      slug: {
        bsonType: 'string',
        description: 'Must be a unique string and is required',
      },
      description: {
        bsonType: 'string',
      },
      discount: {
        bsonType: ['double', 'int'],
        description: 'Must be a double or int and is required',
      },
      offer_start: {
        bsonType: 'date',
        description: 'Must be a date and is required',
      },
      offer_end: {
        bsonType: 'date',
        description: 'Must be a date and is required',
      },
      status: {
        enum: ['draft', 'scheduled', 'active', 'expired', 'paused'],
        description:
          'Must be a "draft"/"scheduled"/"active"/"expired"/"paused" and is required',
      },
      target_items: {
        bsonType: 'array',
        description: 'Must be an array of prices object and is required',
        items: {
          title: 'object',
          properties: {
            product_id: {
              bsonType: 'objectId',
            },
            product_name: {
              bsonType: 'string',
            },
            category_id: {
              bsonType: ['objectId', 'null'],
            },
            category_name: {
              bsonType: 'string',
            },
            price_id: {
              bsonType: 'string',
            },
            price_name: {
              bsonType: 'string',
            },
            original_price: {
              bsonType: ['double', 'int'],
            },
            final_price: {
              bsonType: ['double', 'int'],
            },
          },
        },
      },
      created_at: {
        bsonType: 'date',
        description: 'Must be a date and is required',
      },
      updated_at: {
        bsonType: ['date', 'null'],
      },
    },
  },
}

const POSTS_VALIDATOR: Document = {
  $jsonSchema: {
    bsonType: 'object',
    title: 'posts',
    required: ['post_group_id', 'title', 'slug', 'status'],
    properties: {
      schema_version: {
        bsonType: ['double', 'int', 'decimal'],
      },
      post_group_id: {
        bsonType: 'string',
        description: 'Must be a unique string and is required',
      },
      title: {
        bsonType: 'string',
        description: 'Must be a string and is required',
      },
      slug: {
        bsonType: 'string',
        description: 'Must be a string and is required',
      },
      content: {
        bsonType: 'object',
        title: 'object',
        properties: {
          json: {
            bsonType: 'object',
            title: 'object',
          },
          html: {
            bsonType: 'string',
          },
          text: {
            bsonType: 'string',
          },
        },
      },
      excerpt: {
        bsonType: 'string',
      },
      author_id: {
        bsonType: 'objectId',
      },
      author_name: {
        bsonType: 'string',
      },
      status: {
        enum: ['draft', 'published'],
        description: 'Must be a "draft"/"published" and is required',
      },
      categories: {
        bsonType: 'array',
        items: {
          bsonType: 'objectId',
        },
      },
      thumbnail_image: {
        bsonType: 'object',
        title: 'object',
        properties: {
          src: {
            bsonType: 'string',
          },
          alt: {
            bsonType: 'string',
          },
        },
      },
      has_draft: {
        bsonType: 'bool',
      },
      is_published: {
        bsonType: 'bool',
      },
      comments: {
        bsonType: 'array',
        items: {
          bsonType: 'objectId',
        },
      },
      comment_count: {
        bsonType: 'int',
      },
      view_count: {
        bsonType: 'int',
      },
      linked_posts: {
        bsonType: 'object',
        title: 'object',
        properties: {
          previous_post: {
            bsonType: ['objectId', 'null'],
          },
          next_post: {
            bsonType: ['objectId', 'null'],
          },
          related: {
            bsonType: 'array',
            items: {
              bsonType: 'objectId',
            },
          },
        },
      },
      advanced: {
        bsonType: 'object',
        title: 'object',
        properties: {
          enable_comments: {
            bsonType: 'bool',
          },
          scheduled_publish: {
            bsonType: ['date', 'null'],
          },
        },
      },
      published_at: {
        bsonType: ['date', 'null'],
      },
      scheduled_publish: {
        bsonType: ['date', 'null'],
      },
      created_at: {
        bsonType: 'date',
      },
      updated_at: {
        bsonType: ['date', 'null'],
      },
    },
  },
}

const POSTS_DRAFT_VALIDATOR: Document = {
  $jsonSchema: {
    bsonType: 'object',
    title: 'posts_draft',
    required: ['post_group_id', 'title', 'slug', 'status'],
    properties: {
      schema_version: {
        bsonType: ['double', 'int', 'decimal'],
      },
      post_group_id: {
        bsonType: 'string',
        description: 'Must be a unique string and is required',
      },
      title: {
        bsonType: 'string',
        description: 'Must be a string and is required',
      },
      slug: {
        bsonType: 'string',
        description: 'Must be a string and is required',
      },
      content: {
        bsonType: 'object',
        title: 'object',
        properties: {
          json: {
            bsonType: 'object',
            title: 'object',
          },
          html: {
            bsonType: 'string',
          },
          text: {
            bsonType: 'string',
          },
        },
      },
      excerpt: {
        bsonType: 'string',
      },
      author_id: {
        bsonType: 'objectId',
      },
      author_name: {
        bsonType: 'string',
      },
      status: {
        enum: ['draft', 'published'],
        description: 'Must be a "draft"/"published" and is required',
      },
      categories: {
        bsonType: 'array',
        items: {
          bsonType: 'objectId',
        },
      },
      thumbnail_image: {
        bsonType: 'object',
        title: 'object',
        properties: {
          src: {
            bsonType: 'string',
          },
          alt: {
            bsonType: 'string',
          },
        },
      },
      has_draft: {
        bsonType: 'bool',
      },
      is_published: {
        bsonType: 'bool',
      },
      comments: {
        bsonType: 'array',
        items: {
          bsonType: 'objectId',
        },
      },
      comment_count: {
        bsonType: 'int',
      },
      view_count: {
        bsonType: 'int',
      },
      linked_posts: {
        bsonType: 'object',
        title: 'object',
        properties: {
          previous_post: {
            bsonType: ['objectId', 'null'],
          },
          next_post: {
            bsonType: ['objectId', 'null'],
          },
          related: {
            bsonType: 'array',
            items: {
              bsonType: 'objectId',
            },
          },
        },
      },
      advanced: {
        bsonType: 'object',
        title: 'object',
        properties: {
          enable_comments: {
            bsonType: 'bool',
          },
          scheduled_publish: {
            bsonType: ['date', 'null'],
          },
        },
      },
      published_at: {
        bsonType: ['date', 'null'],
      },
      scheduled_publish: {
        bsonType: ['date', 'null'],
      },
      created_at: {
        bsonType: 'date',
      },
      updated_at: {
        bsonType: ['date', 'null'],
      },
    },
  },
}

const PRODUCTS_VALIDATOR: Document = {
  $jsonSchema: {
    bsonType: 'object',
    title: 'products',
    required: ['product_group_id', 'title', 'slug', 'status'],
    properties: {
      schema_version: {
        bsonType: ['double', 'int', 'decimal'],
      },
      product_group_id: {
        bsonType: 'string',
      },
      title: {
        bsonType: 'string',
        description: 'Must be a string and is required',
      },
      slug: {
        bsonType: 'string',
        description: 'Must be a string and is required',
      },
      short_description: {
        bsonType: 'object',
        title: 'object',
        properties: {
          json: {
            bsonType: 'object',
            title: 'object',
          },
          html: {
            bsonType: 'string',
          },
          text: {
            bsonType: 'string',
          },
        },
      },
      description: {
        bsonType: 'object',
        title: 'object',
        properties: {
          json: {
            bsonType: 'object',
            title: 'object',
          },
          html: {
            bsonType: 'string',
          },
          text: {
            bsonType: 'string',
          },
        },
      },
      author_id: {
        bsonType: 'objectId',
      },
      brand_id: {
        bsonType: ['objectId', 'null'],
      },
      status: {
        enum: ['draft', 'published'],
        description: 'Must be a "draft"/"published" and is required',
      },
      categories: {
        bsonType: 'array',
        items: {
          bsonType: 'objectId',
        },
      },
      thumbnail_image: {
        bsonType: 'object',
        title: 'object',
        properties: {
          src: {
            bsonType: 'string',
          },
          alt: {
            bsonType: 'string',
          },
        },
      },
      images: {
        bsonType: 'array',
        items: {
          title: 'object',
          properties: {
            src: {
              bsonType: 'string',
            },
            alt: {
              bsonType: 'string',
            },
          },
        },
      },
      has_draft: {
        bsonType: 'bool',
      },
      is_published: {
        bsonType: 'bool',
      },
      pricing: {
        bsonType: 'object',
        title: 'object',
        properties: {
          currency: {
            bsonType: 'string',
          },
          prices: {
            bsonType: 'array',
            items: {
              title: 'object',
              properties: {
                id: {
                  bsonType: 'string',
                },
                parent_id: {
                  bsonType: 'string',
                },
                offer_id: {
                  bsonType: ['objectId', 'null'],
                },
                name: {
                  bsonType: 'string',
                },
                offer_name: {
                  bsonType: 'string',
                },
                depth: {
                  bsonType: 'int',
                },
                price: {
                  bsonType: ['double', 'int'],
                },
                discount: {
                  bsonType: ['double', 'int'],
                },
                offer_discount: {
                  bsonType: ['double', 'int'],
                },
                offer: {
                  bsonType: 'string',
                },
                props: {
                  bsonType: 'array',
                  items: {
                    title: 'object',
                    properties: {
                      title: {
                        bsonType: 'string',
                      },
                      values: {
                        bsonType: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
          min_effective_price: {
            bsonType: ['double', 'int'],
          },
          max_effective_price: {
            bsonType: ['double', 'int'],
          },
        },
      },
      inventory: {
        bsonType: 'array',
        items: {
          title: 'object',
          properties: {
            id: {
              bsonType: 'string',
            },
            sku: {
              bsonType: 'string',
            },
            product_id: {
              bsonType: 'string',
            },
            isbn: {
              bsonType: 'string',
            },
            ean: {
              bsonType: 'string',
            },
            gtin: {
              bsonType: 'string',
            },
            stock_quantity: {
              bsonType: 'int',
            },
            stock_status: {
              enum: ['available', 'out_of_stock', 'preorder'],
            },
            low_stock_threshold: {
              bsonType: 'int',
            },
            max_purchase_per_order: {
              bsonType: 'int',
            },
          },
        },
      },
      guarantees: {
        bsonType: 'array',
        items: {
          title: 'object',
          properties: {
            id: {
              bsonType: 'string',
            },
            name: {
              bsonType: 'string',
            },
            duration: {
              bsonType: 'string',
            },
            extra_price: {
              bsonType: ['double', 'int'],
            },
            description: {
              bsonType: 'string',
            },
            prices: {
              bsonType: 'array',
              items: {
                title: 'object',
                properties: {
                  id: {
                    bsonType: 'string',
                  },
                  fullName: {
                    bsonType: 'string',
                  },
                  price: {
                    bsonType: ['double', 'int'],
                  },
                },
              },
            },
            extra_duration: {
              bsonType: 'array',
              items: {
                title: 'object',
                properties: {
                  id: {
                    bsonType: 'string',
                  },
                  duration: {
                    bsonType: 'string',
                  },
                  price: {
                    bsonType: ['double', 'int'],
                  },
                },
              },
            },
          },
        },
      },
      shipping: {
        bsonType: 'object',
        title: 'object',
        properties: {
          weight: {
            bsonType: ['double', 'int'],
          },
          weight_unit: {
            bsonType: 'string',
          },
          dimensions: {
            bsonType: 'object',
            title: 'object',
            properties: {
              length: {
                bsonType: ['double', 'int'],
              },
              width: {
                bsonType: ['double', 'int'],
              },
              height: {
                bsonType: ['double', 'int'],
              },
              unit: {
                bsonType: 'string',
              },
            },
          },
          shipping_class: {
            bsonType: 'string',
          },
        },
      },
      linked_products: {
        bsonType: 'object',
        title: 'object',
        properties: {
          upsells: {
            bsonType: 'array',
            items: {
              bsonType: 'objectId',
            },
          },
          cross_sells: {
            bsonType: 'array',
            items: {
              bsonType: 'objectId',
            },
          },
          related: {
            bsonType: 'array',
            items: {
              bsonType: 'objectId',
            },
          },
        },
      },
      features: {
        bsonType: 'array',
        items: {
          title: 'object',
          properties: {
            feature_id: {
              bsonType: 'objectId',
            },
            value_id: {
              bsonType: 'int',
            },
          },
        },
      },
      advanced: {
        bsonType: 'object',
        title: 'object',
        properties: {
          purchase_note: {
            bsonType: 'string',
          },
          enable_reviews: {
            bsonType: 'bool',
          },
          average_rating: {
            bsonType: ['double', 'int'],
          },
          review_count: {
            bsonType: 'int',
          },
        },
      },
      stats: {
        bsonType: 'object',
        title: 'object',
        properties: {
          total_sales: {
            bsonType: 'int',
          },
          total_revenue: {
            bsonType: ['double', 'int'],
          },
        },
      },
      published_at: {
        bsonType: ['date', 'null'],
      },
      created_at: {
        bsonType: 'date',
      },
      updated_at: {
        bsonType: ['date', 'null'],
      },
    },
  },
}

const PRODUCTS_DRAFT_VALIDATOR: Document = {
  $jsonSchema: {
    bsonType: 'object',
    title: 'products',
    required: ['product_group_id', 'title', 'slug', 'status'],
    properties: {
      schema_version: {
        bsonType: ['double', 'int', 'decimal'],
      },
      product_group_id: {
        bsonType: 'string',
      },
      title: {
        bsonType: 'string',
        description: 'Must be a string and is required',
      },
      slug: {
        bsonType: 'string',
        description: 'Must be a string and is required',
      },
      short_description: {
        bsonType: 'object',
        title: 'object',
        properties: {
          json: {
            bsonType: 'object',
            title: 'object',
          },
          html: {
            bsonType: 'string',
          },
          text: {
            bsonType: 'string',
          },
        },
      },
      description: {
        bsonType: 'object',
        title: 'object',
        properties: {
          json: {
            bsonType: 'object',
            title: 'object',
          },
          html: {
            bsonType: 'string',
          },
          text: {
            bsonType: 'string',
          },
        },
      },
      author_id: {
        bsonType: 'objectId',
      },
      brand_id: {
        bsonType: ['objectId', 'null'],
      },
      status: {
        enum: ['draft', 'published'],
        description: 'Must be a "draft"/"published" and is required',
      },
      categories: {
        bsonType: 'array',
        items: {
          bsonType: 'objectId',
        },
      },
      thumbnail_image: {
        bsonType: 'object',
        title: 'object',
        properties: {
          src: {
            bsonType: 'string',
          },
          alt: {
            bsonType: 'string',
          },
        },
      },
      images: {
        bsonType: 'array',
        items: {
          title: 'object',
          properties: {
            src: {
              bsonType: 'string',
            },
            alt: {
              bsonType: 'string',
            },
          },
        },
      },
      has_draft: {
        bsonType: 'bool',
      },
      is_published: {
        bsonType: 'bool',
      },
      pricing: {
        bsonType: 'object',
        title: 'object',
        properties: {
          currency: {
            bsonType: 'string',
          },
          prices: {
            bsonType: 'array',
            items: {
              title: 'object',
              properties: {
                id: {
                  bsonType: 'string',
                },
                parent_id: {
                  bsonType: 'string',
                },
                offer_id: {
                  bsonType: ['objectId', 'null'],
                },
                name: {
                  bsonType: 'string',
                },
                offer_name: {
                  bsonType: 'string',
                },
                depth: {
                  bsonType: 'int',
                },
                price: {
                  bsonType: ['double', 'int'],
                },
                discount: {
                  bsonType: ['double', 'int'],
                },
                offer_discount: {
                  bsonType: ['double', 'int'],
                },
                offer: {
                  bsonType: 'string',
                },
                props: {
                  bsonType: 'array',
                  items: {
                    title: 'object',
                    properties: {
                      title: {
                        bsonType: 'string',
                      },
                      values: {
                        bsonType: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
          min_effective_price: {
            bsonType: ['double', 'int'],
          },
          max_effective_price: {
            bsonType: ['double', 'int'],
          },
        },
      },
      inventory: {
        bsonType: 'array',
        items: {
          title: 'object',
          properties: {
            id: {
              bsonType: 'string',
            },
            sku: {
              bsonType: 'string',
            },
            product_id: {
              bsonType: 'string',
            },
            isbn: {
              bsonType: 'string',
            },
            ean: {
              bsonType: 'string',
            },
            gtin: {
              bsonType: 'string',
            },
            stock_quantity: {
              bsonType: 'int',
            },
            stock_status: {
              enum: ['available', 'out_of_stock', 'preorder'],
            },
            low_stock_threshold: {
              bsonType: 'int',
            },
            max_purchase_per_order: {
              bsonType: 'int',
            },
          },
        },
      },
      guarantees: {
        bsonType: 'array',
        items: {
          title: 'object',
          properties: {
            id: {
              bsonType: 'string',
            },
            name: {
              bsonType: 'string',
            },
            duration: {
              bsonType: 'string',
            },
            extra_price: {
              bsonType: ['double', 'int'],
            },
            description: {
              bsonType: 'string',
            },
            prices: {
              bsonType: 'array',
              items: {
                title: 'object',
                properties: {
                  id: {
                    bsonType: 'string',
                  },
                  fullName: {
                    bsonType: 'string',
                  },
                  price: {
                    bsonType: ['double', 'int'],
                  },
                },
              },
            },
            extra_duration: {
              bsonType: 'array',
              items: {
                title: 'object',
                properties: {
                  id: {
                    bsonType: 'string',
                  },
                  duration: {
                    bsonType: 'string',
                  },
                  price: {
                    bsonType: ['double', 'int'],
                  },
                },
              },
            },
          },
        },
      },
      shipping: {
        bsonType: 'object',
        title: 'object',
        properties: {
          weight: {
            bsonType: ['double', 'int'],
          },
          weight_unit: {
            bsonType: 'string',
          },
          dimensions: {
            bsonType: 'object',
            title: 'object',
            properties: {
              length: {
                bsonType: ['double', 'int'],
              },
              width: {
                bsonType: ['double', 'int'],
              },
              height: {
                bsonType: ['double', 'int'],
              },
              unit: {
                bsonType: 'string',
              },
            },
          },
          shipping_class: {
            bsonType: 'string',
          },
        },
      },
      linked_products: {
        bsonType: 'object',
        title: 'object',
        properties: {
          upsells: {
            bsonType: 'array',
            items: {
              bsonType: 'objectId',
            },
          },
          cross_sells: {
            bsonType: 'array',
            items: {
              bsonType: 'objectId',
            },
          },
          related: {
            bsonType: 'array',
            items: {
              bsonType: 'objectId',
            },
          },
        },
      },
      features: {
        bsonType: 'array',
        items: {
          title: 'object',
          properties: {
            feature_id: {
              bsonType: 'objectId',
            },
            value_id: {
              bsonType: 'int',
            },
          },
        },
      },
      advanced: {
        bsonType: 'object',
        title: 'object',
        properties: {
          purchase_note: {
            bsonType: 'string',
          },
          enable_reviews: {
            bsonType: 'bool',
          },
          average_rating: {
            bsonType: ['double', 'int'],
          },
          review_count: {
            bsonType: 'int',
          },
        },
      },
      stats: {
        bsonType: 'object',
        title: 'object',
        properties: {
          total_sales: {
            bsonType: 'int',
          },
          total_revenue: {
            bsonType: ['double', 'int'],
          },
        },
      },
      published_at: {
        bsonType: ['date', 'null'],
      },
      created_at: {
        bsonType: 'date',
      },
      updated_at: {
        bsonType: ['date', 'null'],
      },
    },
  },
}

const USERS_VALIDATOR: Document = {
  $jsonSchema: {
    bsonType: 'object',
    title: 'users',
    required: [
      'username',
      'email',
      'password',
      'role',
      'status',
      'created_at',
      'updated_at',
    ],
    properties: {
      schema_version: {
        bsonType: ['double', 'int', 'decimal'],
      },
      username: {
        bsonType: 'string',
      },
      email: {
        bsonType: 'string',
      },
      password: {
        bsonType: 'string',
      },
      profile: {
        bsonType: 'object',
        title: 'object',
        properties: {
          name: {
            bsonType: 'string',
          },
          family: {
            bsonType: 'string',
          },
          avatar: {
            bsonType: 'string',
          },
        },
      },
      role: {
        enum: ['author', 'editor', 'store_manager', 'general_manager', 'admin'],
      },
      status: {
        enum: ['active', 'inactive'],
      },
      preferences: {
        bsonType: 'object',
        title: 'object',
        properties: {
          email_notifications: {
            bsonType: 'bool',
          },
        },
      },
      created_at: {
        bsonType: 'date',
      },
      updated_at: {
        bsonType: 'date',
      },
      last_login: {
        bsonType: ['date', 'null'],
      },
    },
  },
}
// ===== COLLECTION_CONFIG =====
export const COLLECTION_CONFIG: Partial<
  Record<CollectionName, CollectionConfig>
> = {
  [COLLECTIONS.BRANDS]: {
    validator: BRANDS_VALIDATOR,
    indexes: [
      {
        key: {
          slug: -1,
        },
        name: 'slug_-1',
        unique: true,
      },
    ],
  },
  [COLLECTIONS.CATEGORY]: {
    validator: CATEGORY_VALIDATOR,
    indexes: [
      {
        key: {
          name: -1,
        },
        name: 'name_-1',
      },
      {
        key: {
          category_group: 1,
        },
        name: 'category_group_1',
      },
    ],
  },
  [COLLECTIONS.FEATURES]: {
    validator: FEATURES_VALIDATOR,
    indexes: [
      {
        key: {
          slug: -1,
        },
        name: 'slug_-1',
        unique: true,
      },
    ],
  },
  [COLLECTIONS.GUARANTEES]: {
    validator: GUARANTEES_VALIDATOR,
    indexes: [
      {
        key: {
          slug: -1,
        },
        name: 'slug_-1',
        unique: true,
      },
      {
        key: {
          'target_items.price_id': -1,
        },
        name: 'target_items.price_id_-1',
        unique: true,
      },
    ],
  },
  [COLLECTIONS.OFFERS]: {
    validator: OFFERS_VALIDATOR,
    indexes: [
      {
        key: {
          slug: -1,
        },
        name: 'slug_-1',
        unique: true,
      },
    ],
  },
  [COLLECTIONS.POSTS]: {
    validator: POSTS_VALIDATOR,
    indexes: [
      {
        key: {
          slug: -1,
        },
        name: 'slug_-1',
        unique: true,
      },
      {
        key: {
          post_groupt_id: -1,
        },
        name: 'post_groupt_id_-1',
      },
    ],
  },
  [COLLECTIONS.POSTS_DRAFT]: {
    validator: POSTS_DRAFT_VALIDATOR,
    indexes: [
      {
        key: {
          slug: -1,
        },
        name: 'slug_-1',
        unique: true,
      },
      {
        key: {
          post_group_id: -1,
        },
        name: 'post_group_id_-1',
      },
    ],
  },
  [COLLECTIONS.PRODUCTS]: {
    validator: PRODUCTS_VALIDATOR,
    indexes: [
      {
        key: {
          slug: -1,
        },
        name: 'slug_-1',
        unique: true,
      },
      {
        key: {
          product_group_id: -1,
        },
        name: 'product_group_id_-1',
        unique: true,
      },
    ],
  },
  [COLLECTIONS.PRODUCTS_DRAFT]: {
    validator: PRODUCTS_DRAFT_VALIDATOR,
    indexes: [
      {
        key: {
          slug: -1,
        },
        name: 'slug_-1',
        unique: true,
      },
      {
        key: {
          product_group_id: -1,
        },
        name: 'product_group_id_-1',
      },
    ],
  },
  [COLLECTIONS.USERS]: {
    validator: USERS_VALIDATOR,
  },
}
