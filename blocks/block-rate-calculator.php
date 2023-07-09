<?php
/**
 * Rate Calculator block
 *
 * @package nbu
 */

function rate_calculator() {
	if ( function_exists( 'acf_register_block_type' ) ) {
		$settings = array(
			'name'        => 'rate-calculator',
			'title'       => 'Rate Calculator',
			'description' => 'Display a rate calculator on the page.',
			'category'    => 'nbu',
			'icon'        => array(
				'foreground' => '#cc0000',
				'src'        => 'dashicons-calculator',
			),
			'keywords'    => array( 'menu', 'rate calculator', 'navigation', 'actions', 'NBU' ),
			'mode'        => 'auto',
			'post_types'  => array( 'page' ),
			'supports'    => array(
				'align'    => false,
				'multiple' => false,
			),
		);
		$settings['render_template'] = mg_block_render_template_path( $settings['name'] );

		acf_register_block_type( $settings );
	}
}
add_action( 'acf/init', 'rate_calculator' );
