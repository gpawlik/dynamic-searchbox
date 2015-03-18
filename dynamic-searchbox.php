<?php
/**
* Plugin Name: Dynamic Searchbox
* Plugin URI: http://edreamsodigeo.com/
* Description: A dynamic widget with flight searchbox created for Odigeo.
* Version: 1.0
* Author: Grzegorz Pawlik
* Author URI: http://gpawlik.com
* License: GPL12
*/

// Register the Custom Music Review Post Type
 
class wp_dynamic_searchbox extends WP_Widget {
    
        /*
        * Plugin PATH var setup
        */
        var $pluginPath;    

	// constructor
	function wp_dynamic_searchbox() {                        
            
            parent::WP_Widget(false, $name = __('Dynamic Searchbox', 'wp_widget_plugin') );
            
            // Set Plugin Path  
            //$this->pluginPath = plugin_dir_path( __FILE__ ); 
            
            // Setup localization
            add_action('init', array($this, 'load_plugin_textdomain'));
            
	}

        // widget form creation
        function form($instance) {

            // Check values
            if( $instance) {
                 $title       = esc_attr($instance['title']);
                 $button_text = esc_attr($instance['button_text']);
                 $brand       = esc_attr($instance['brand']);
                 $itinerary   = esc_attr($instance['itinerary']);
            } else {
                 $title       = '';
                 $button_text = '';
                 $brand       = 'edreams';
                 $itinerary   = 'timespan';
            }
            ?>

            <p>
                <label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Custom Title:', 'sb_widget_title'); ?></label>
                <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $title; ?>" />
            </p>

            <p>
                <label for="<?php echo $this->get_field_id('button_text'); ?>"><?php _e('Custom Button Text:', 'sb_custom_button_text'); ?></label>
                <input class="widefat" id="<?php echo $this->get_field_id('button_text'); ?>" name="<?php echo $this->get_field_name('button_text'); ?>" type="text" value="<?php echo $button_text; ?>" />
            </p>
            
            <p>
                <label for="<?php echo $this->get_field_id('brand'); ?>"><?php _e('Brand:', 'sb_brand'); ?></label>                
                <select id="<?php echo $this->get_field_id('brand'); ?>" name="<?php echo $this->get_field_name('brand'); ?>">
                    <option value="edreams" <?php selected($brand, 'edreams'); ?>>eDreams </option>
                    <!--<option value="opodo" <?php selected($brand, 'opodo'); ?>>Opodo </option>-->
                    <option value="travellink" <?php selected($brand, 'travellink'); ?>>Travellink </option>
                    <!--<option value="govoyages" <?php selected($brand, 'govoyages'); ?>>GoVoyages </option>-->                    
                </select>
            </p>
            
            <p>
                <label for="<?php echo $this->get_field_id('itinerary'); ?>"><?php _e('Itinerary type:', 'sb_itinerary'); ?></label>                
                <select id="<?php echo $this->get_field_id('itinerary'); ?>" name="<?php echo $this->get_field_name('itinerary'); ?>">
                    <option value="timespan" <?php selected($itinerary, 'timespan'); ?>>Time-spans </option>
                    <option value="monthly" <?php selected($itinerary, 'monthly'); ?>>Month specific </option>                                       
                </select>
            </p>
            
        <?php
        }

        // update widget
        function update($new_instance, $old_instance) {
              $instance = $old_instance;
              // Fields
              $instance['title']       = strip_tags($new_instance['title']);
              $instance['button_text'] = strip_tags($new_instance['button_text']);
              $instance['brand']       = strip_tags($new_instance['brand']);
              $instance['itinerary']   = strip_tags($new_instance['itinerary']);
             return $instance;
        }

        // display widget
        function widget($args, $instance) {
           extract( $args );
           
           // these are the widget options
           $title       = apply_filters('widget_title', $instance['title']);
           $button_text = $instance['text'];
           $brand       = $instance['brand'];
           $itinerary   = $instance['itinerary'];
           
           // cross-wp variables
           $default_origin_name = get_post_meta(get_the_ID(), 'sb-city-name', true);
           $default_origin_iata = get_post_meta(get_the_ID(), 'sb-city-iata', true);
           
           $page_extension = __('com', 'dynamic-searchbox');                       
           
            // Load scripts            
            if( !is_admin() ) {
                wp_register_script( 'custom-script', plugins_url('/js/sb_scripts.js?v=1.0.1.', __FILE__), array( 'jquery') );
                wp_register_script( 'validate', plugins_url('/js/libs/jquery.validate.min.js', __FILE__), array( 'jquery') );                               
                wp_register_script( 'jquery-ui-core-new', plugins_url('/js/libs/jquery-ui.min.js', __FILE__), array( 'jquery') );
                
                wp_register_style( 'jquery-ui', plugins_url('/css/libs/jquery-ui.min.css', __FILE__) );
                wp_register_style( 'jquery-ui-structure', plugins_url('/css/libs/jquery-ui.theme.min.css', __FILE__) );
                wp_register_style( 'jquery-ui-theme', plugins_url('/css/libs/jquery-ui.structure.min.css', __FILE__) );
                wp_register_style( 'sb_style', plugins_url('/css/sb_style.css', __FILE__) );                
                
                wp_enqueue_script( 'custom-script' );                                
                wp_enqueue_script( 'validate' );     
                wp_enqueue_script( 'jquery-ui-core-new' );
                //wp_enqueue_script( 'jquery-ui-autocomplete' ); /* doesnt work with current version of ui (1.10), ui.core of 1.11 hardcoded... */
                //wp_enqueue_script( 'jquery-ui-datepicker' );
                
                wp_enqueue_style( 'jquery-ui' );
                wp_enqueue_style( 'jquery-ui-structure' );
                wp_enqueue_style( 'jquery-ui-theme' );
                wp_enqueue_style( 'sb_style' );
                
                if($page_extension !== 'com') {
                    wp_register_script( 'datepicker-locale', plugins_url('/js/libs/datepicker/jquery.ui.datepicker-' . $page_extension . '.js', __FILE__), array( 'jquery', 'jquery-ui-core' ) );
                    wp_enqueue_script( 'datepicker-locale' );
                } 
            }                      
            
           echo $before_widget;           
           echo '<div class="widget-text sb_widget">';

           require_once( __DIR__ . '/templates/main.php');
           
           echo '</div>';
           echo $after_widget;
        }                                                 
 
        
        public function load_plugin_textdomain()
        {
            load_plugin_textdomain('dynamic-searchbox', FALSE, dirname(plugin_basename(__FILE__)).'/lang/');            
        }        
        
}


// register widget
add_action('widgets_init', create_function('', 'return register_widget("wp_dynamic_searchbox");'));


